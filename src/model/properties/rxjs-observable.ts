import {EngineModel, EngineProperty, PropertySource} from "../model";
import {
  animationFrames,
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  combineLatest,
  concat,
  EMPTY,
  forkJoin,
  from,
  interval,
  merge,
  Observable,
  observeOn,
  queueScheduler,
  race,
  range,
  scheduled,
  SchedulerLike,
  Subscription,
  timer
} from "rxjs";
import {propertyNamesToPropertyArrays, schedulerByName} from "./utils";

/*
 format:
 {
    rxjs: nameOfObserver,
    parameters: any
      for combineLatest - propertyName1,propertyName2,...propertyNameN,
      for concat - propertyName1,propertyName2,...propertyNameN,
 }
*/

export const rxjsObservable = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  function paramsAsPropNames(): Observable<any>[] | void {
    return propertyNamesToPropertyArrays(m, s.data.parameters);
  }
  function paramsAsScheduler(p = s.data.parameters): SchedulerLike {
    return schedulerByName(p);
  }
  const rxjs = s.data.rxjs;
  if (typeof rxjs === 'string') {
    switch (rxjs) {
      case 'animationFrames':
        return animationFrames();
      case 'combineLatest': {
        const obs = paramsAsPropNames();
        if (obs && obs.length > 0) {
          return combineLatest(obs);
        }
        break;
      }
      case 'concat': {
        const obs = paramsAsPropNames();
        if (obs && obs.length > 0) {
          return concat(obs);
        }
        break;
      }
      case 'forkJoin': {
        const obs = paramsAsPropNames();
        if (obs && obs.length > 0) {
          return forkJoin(obs);
        }
        break;
      }
      case 'from': {
        const obs = paramsAsPropNames();
        if (obs) {
          return new Observable(subscriber => {
            const subs = new Subscription();
            subs.add(concat(obs).subscribe(a => {
              subs.add(from(a).subscribe(f => subscriber.next(f)));
            }))
            return {
              unsubscribe() {
                subs.unsubscribe();
              }
            }
          });
        }
        break;
      }
      case 'interval': {
        /**
         * data.parameters = {
         *  scheduler?: string,
         *  interval?: number
         * }
         */
        return interval(s.data?.parameters?.interval, paramsAsScheduler(s.data?.parameters?.scheduler));
      }
      case 'merge': {
        const obs = paramsAsPropNames();
        if (obs && obs.length > 0) {
          return merge(obs);
        }
        break;
      }
      case 'race': {
        const obs = paramsAsPropNames();
        if (obs && obs.length > 0) {
          return race(obs);
        }
        break;
      }
      case 'range': {
        /**
         * data.parameters = {
         * start?: number,
         * count?: number,
         * scheduler?: string
         * }
         */
        return range(s.data?.parameters?.start?? 0, s.data?.parameters?.count).pipe(observeOn(paramsAsScheduler(s.data?.parameters?.scheduler)));
      }
      case 'scheduled': {
        /**
         * data.parameters = {
         * input: string,
         * scheduler?: string
         * }
         */
        const input = s.data?.parameters?.input;
        if (typeof input === 'string') {
          return scheduled(m.properties[input], paramsAsScheduler(s.data?.parameters?.scheduler));
        }
        break;
      }
      case 'timer': {
        /**
         * data.parameters = {
         * dueTime?: number,
         * intervalOrScheduler?: number
         * scheduler?: string
         * }
         */
        const dueTime = s.data?.parameters?.dueTime;
        const intervalOrScheduler = s.data?.parameters?.intervalOrScheduler;
        if (typeof intervalOrScheduler === 'number') {
          return timer(typeof dueTime === 'number' ? dueTime : 0, intervalOrScheduler, paramsAsScheduler(s.data?.parameters?.scheduler));
        }
        return timer(typeof dueTime === 'number' ? dueTime : 0, paramsAsScheduler(s.data?.parameters?.scheduler));
      }
      case 'zip': {
        const obs = paramsAsPropNames();
        if (obs && obs.length > 0) {
          return race(obs);
        }
        break;
      }
    }
  }
  return EMPTY;
};

/*
 operators
*/
