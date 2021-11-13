import {EngineModel, EngineProperty, PropertySource} from "../model";
import {EMPTY, Observable, of, Subscription} from "rxjs";

function parse(v: any): any {
  if (typeof v === 'string') {
    try {
      return JSON.parse(v);
    } catch (e) {}
  }
  return v;
}
function stringify(v: any): string {
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch (e) {}
  }
  return '' + v;
}
export const asJsonObject = (m: EngineModel, s: PropertySource): EngineProperty<any> => of(parse(s.data));
export const asString = (m: EngineModel, s: PropertySource): EngineProperty<any> => of(stringify(s.data));
/**
 * format:
 * {
 *   condition: property name,
 *   then: property name,
 *   else?: property name
 * }
 * @param m
 * @param s
 */
export const ifElse = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  if (typeof s.data.condition === 'string' && typeof s.data.then === 'string') {
    const condition = s.data.condition;
    const thenP = s.data.then;
    const elseP = s.data.else;
    return new Observable( subscriber => {
      const subscribe = new Subscription();
      let branch: Subscription | null;
      subscribe.add(m.properties[condition].subscribe({
        next: (v) => {
          if (branch) {
            subscribe.remove(branch);
            branch.unsubscribe();
            branch = null;
          }
          if (!!v) {
            branch = m.properties[thenP].subscribe(v => subscriber.next(v));
          } else if (elseP) {
            branch = m.properties[elseP].subscribe(v => subscriber.next(v));
          }
          if (branch) {
            subscriber.add(branch);
          }
        }
      }));
      return {
        unsubscribe() {
          subscribe.unsubscribe();
        }
      }
    });
  }
  return of(s);
};
/**
 * format: {
 *   expression: {
 *     case1: propertyName
 *     case2: propertyName
 *     default: propertyName
 *   }
 * }
 * expression - name's property that emits case
 * case: propertyName - is property that would be emitted
 * @param m
 * @param s
 */
export const sSwitch = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  if (typeof s.data === 'object' && Object.keys(s.data).length === 1) {
    const expression = Object.keys(s.data)[0];
    const switchBlk = s.data[expression];
    if (typeof switchBlk === 'object' && switchBlk !== null) {
      return new Observable( subscriber => {
        const subscribe = new Subscription();
        let branch: Subscription | null;
        subscribe.add(m.properties[expression].subscribe({
          next: (v) => {
            if (branch) {
              subscribe.remove(branch);
              branch.unsubscribe();
              branch = null;
            }
            if (typeof switchBlk[expression] === 'string') {
              branch = m.properties[switchBlk[expression]].subscribe(v => subscriber.next(v));
            } else if (typeof switchBlk['default'] === 'string') {
              branch = m.properties[switchBlk['default']].subscribe(v => subscriber.next(v));
            }
            if (branch) {
              subscriber.add(branch);
            }
          }
        }));
        return {
          unsubscribe() {
            subscribe.unsubscribe();
          }
        }
      });
    }
  }
  return EMPTY;
}
/**
 * format:
 * destination=source
 * where destination and source are property names
 * @param m
 * @param s
 */
export const setProperty = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
    if (typeof s.data === 'string') {
      const res = /([-_a-zA-Z0-9]+)\s*=\s*([-_a-zA-Z0-9]+)/.exec(s.data);
      if (res) {
        const destination = res[1];
        const source = res[2];
        return new Observable(subscriber => {
          const subs = m.properties[source].subscribe({
            next: (v) => {
              m.properties[destination] = v;
              subscriber.next(true);
            },
            error: (e) => {
              m.properties[destination] = EMPTY;
              subscriber.error(e);
            }
          });
          return {
            unsubscribe() {
              subs.unsubscribe();
            }
          };
        });
      }
    }
    return of(s);
};
