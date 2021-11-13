import {EngineEnvironment, EngineModel, EngineProperties, EngineProperty, EnginePropertyFunc} from "./model";
import {
  asyncScheduler,
  AsyncSubject,
  EMPTY,
  isObservable,
  of,
  ReplaySubject,
  Subject,
  subscribeOn,
  Subscription
} from "rxjs";
import {defaultPropertyFactory} from "./property-factory";

const voidFnc = () => undefined;

const factory = (f: EnginePropertyFunc, m: EngineModel) => (v: any) => f(m, v);
const DISPOSE = Symbol('Engine.dispose');

function proxyHandler(m: EngineModel): ProxyHandler<EngineProperties> {
  const original: { [key: string]: { s: Subscription, o: EngineProperty<any> } } = {};
  const subscription = new Subscription();
  const debugFnc = m.environment?.debugFnc || voidFnc;
  return {
    get(target: EngineProperties, p: PropertyKey): any {
      if (typeof p === 'symbol') {
        if (p === Symbol.toPrimitive) {
          return (hint: any) => {
            switch (hint) {
              case 'number':
                return NaN;
              case 'string':
                return '' + Object.keys(target);
              default:
                return 'properties';
            }
          };
        } else if (p === DISPOSE) {
          for (const n in target) {
            if (target.hasOwnProperty(n)) {
              delete target[n];
            }
          }
          for (const n in original) {
            if (original.hasOwnProperty(n)) {
              delete original[n];
            }
          }
          subscription.unsubscribe();
          return EMPTY;
        } else if (p === Symbol.toStringTag) {
          return 'properties:' + Object.keys(target);
        }
      }
      if (typeof p === 'string') {
        if (!target[p]) {
          target[p] = new ReplaySubject(1);
        }
        return target[p];
      }
      return EMPTY;
    },
    deleteProperty(target: EngineProperties, name: PropertyKey): boolean {
      if (typeof name !== 'string' || !target.hasOwnProperty(name)) {
        return false;
      }
      if (original[name as string]) {
        const orig = original[name];
        if (orig) {
          if (orig.s) {
            subscription.remove(orig.s);
            orig.s.unsubscribe();
          }
          if (orig.o && orig.o.dispose) {
            orig.o.dispose();
          }
        }
      }
      delete target[name];
      m.asyncSubject.next('delete-property');
      return true;
    },
    set(target: EngineProperties, name: PropertyKey, v: any): boolean {
      if (typeof name !== 'string') {
        return false;
      }
      const event = {event: '', name};
      if (original[name as string]) {
        const orig = original[name];
        if (orig) {
          if (orig.s) {
            subscription.remove(orig.s);
            orig.s.unsubscribe();
          }
          if (orig.o && orig.o.dispose) {
            orig.o.dispose();
          }
        }
        event.event = 'property-modified';
      } else {
        if (!target[name as string]) {
          target[name as string] = new ReplaySubject(1);
        }
        event.event = 'property-added';
      }
      let source = v;
      let property = v;
      delete target[name as string].enginePropertyCfg;
      if (!isObservable(v)) {
        target[name as string].enginePropertyCfg = v;
        let f: EnginePropertyFunc | undefined;
        if (!v || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint' || typeof v === 'symbol') {
          f = of;
        } else {
          try {
            const propertyFactory = m.environment?.propertyFactory || (() => of);
            const obj = typeof v === 'string' ? JSON.parse(v) : v;
            f = propertyFactory(obj);
            if (!f) {
              f = of;
            } else {
              source = obj;
            }
          } catch (e) {
            f = of;
          }
        }
        property = factory(f, m)(source).pipe(subscribeOn(asyncScheduler));
      }
      original[name] = {
        o: property,
        s: property.subscribe((n: any) => {
          (target[name] as Subject<any>).next(n);
          debugFnc(name, n, source);
        })
      };
      subscription.add(original[name].s);
      m.asyncSubject.next(event);
      return true;
    }
  };
}

export class SimpleEngineModel implements EngineModel {
  asyncSubject = new AsyncSubject();
  properties: EngineProperties = {};
  environment: EngineEnvironment;

  constructor(public parent?: EngineModel, environment?: EngineEnvironment) {
    this.environment = {propertyFactory: environment?.propertyFactory || defaultPropertyFactory, ...environment};
    this.properties = new Proxy({}, proxyHandler(this as unknown as EngineModel));
  }

  destroy(): void {
    this.asyncSubject.complete();
    for (const p in this.properties) {
      delete this.properties[p];
    }
  }
  static fromJson(json: string, parent?: EngineModel, environment?: EngineEnvironment): SimpleEngineModel {
    try {
      return SimpleEngineModel.fromObject(JSON.parse(json), parent, environment);
    } catch (e) {
      return new SimpleEngineModel(parent, (parent as SimpleEngineModel)?.environment);
    }
  }
  static fromObject(object: any, parent?: EngineModel, environment?: EngineEnvironment): SimpleEngineModel {
    const model = new SimpleEngineModel(parent, environment || (parent as SimpleEngineModel)?.environment);
    if (typeof object === 'object') {
      for (const [key, value] of Object.entries<any>(object)) {
        (model.properties as any)[key] = value;
      }
    }
    return model;
  }
}
