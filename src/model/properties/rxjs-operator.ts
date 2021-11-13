import {EngineModel, EngineProperty, PropertySource} from "../model";
import * as _ from 'lodash';
import {
  audit,
  auditTime,
  buffer,
  bufferCount,
  bufferTime,
  bufferToggle,
  bufferWhen,
  catchError,
  combineLatestAll,
  combineLatestWith,
  concatAll,
  debounce,
  debounceTime,
  delay,
  delayWhen,
  distinct,
  elementAt,
  EMPTY,
  Observable,
  observeOn,
  pairwise,
  raceWith,
  repeat,
  retry,
  sample,
  sampleTime,
  SchedulerLike,
  skip,
  skipUntil,
  subscribeOn,
  switchAll,
  take,
  takeUntil,
  tap,
  throttle,
  throttleTime,
  timeInterval,
  timeout,
  timestamp,
  window as windowRxjs,
  windowCount,
  windowTime,
  windowToggle,
  windowWhen
} from "rxjs";
import {propertyNamesToPropertyArrays, schedulerByName} from "./utils";

/*
 format:
 {
    rxjs: string, // nameOfOperator,
    source: string, // propertyName
    parameters: any
      for combineLatest - propertyName1,propertyName2,...propertyNameN,
      for concat - propertyName1,propertyName2,...propertyNameN,
 }
*/

export const rxjsOperator = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  function paramsAsPropNames(): Observable<any>[] | void {
    return propertyNamesToPropertyArrays(m, s.data.parameters);
  }
  function paramsAsScheduler(p = s.data.parameters): SchedulerLike {
    return schedulerByName(p);
  }
  const rxjs = s.data.rxjs;
  const source = s.data?.source;
  const parameters = s.data.parameters;
  if (typeof rxjs === 'string' && typeof source === 'string') {
    const sourceObs = m.properties[source];
    switch (rxjs) {
      case 'audit': {
        /**
         * parameters: string property name the value of durationSelector
         */
        if (typeof parameters === 'string') {
          return audit(() => m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'auditTime': {
        /**
         * parameters: {
         *   duration: number,
         *   scheduler: string
         * }
         */
        const duration = typeof parameters?.duration === 'number' ? parameters?.duration : 0;
        return auditTime(duration, paramsAsScheduler(parameters?.scheduler))(sourceObs);
      }
      case 'buffer': {
        /**
         * parameters: string property name the value of closingNotifier
         */
        if (typeof parameters === 'string') {
          return buffer(m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'bufferCount': {
        /**
         * parameters: {
         *   bufferSize: number,
         *   startBufferEvery?: number
         * }
         */
        if (typeof parameters?.bufferSize === 'number' && parameters?.bufferSize > 0) {
          return bufferCount(parameters?.bufferSize,
            typeof parameters?.startBufferEvery === 'number' ? parameters?.startBufferEvery : null)(sourceObs);
        }
        break;
      }
      case 'bufferTime': {
        /**
         * parameters: {
         *   bufferTimeSpan: number,
         *   scheduler: string,
         *   bufferCreationInterval: number,
         *   maxBufferSize: number
         * }
         */
        const scheduler = typeof parameters?.scheduler === 'string' ? paramsAsScheduler(parameters.scheduler) : undefined;
        const bufferCreationInterval = typeof parameters?.bufferCreationInterval === 'number' ? parameters.bufferCreationInterval : undefined;
        const maxBufferSize = typeof parameters?.maxBufferSize === 'number' ? parameters.maxBufferSize : undefined;
        if (typeof parameters?.bufferTimeSpan === 'number' && parameters.bufferTimeSpan > 0) {
          return bufferTime(parameters.bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler)(sourceObs);
        }
        break;
      }
      case 'bufferToggle': {
        /**
         * parameters: {
         *   openings: string,
         *   closing: string,
         * }
         */
        const openings = typeof parameters?.openings === 'string' ? m.properties[parameters.openings] : undefined;
        const closing = typeof parameters?.closing === 'string' ? m.properties[parameters.closing] : undefined;
        if (openings && closing) {
          return bufferToggle(openings, () => closing)(sourceObs);
        }
        break;
      }
      case 'bufferWhen': {
        /**
         * parameters: string
         */
        const closing = typeof parameters === 'string' ? m.properties[parameters] : undefined;
        if (closing) {
          return bufferWhen(() => closing)(sourceObs);
        }
        break;
      }
      case 'catchError': {
        /**
         * parameters: string,
         */
        const selector = typeof parameters === 'string' ? m.properties[parameters] : undefined;
        if (selector) {
          return catchError(() => selector)(sourceObs);
        }
        break;
      }
      case 'combineLatestAll': {
        return combineLatestAll()(sourceObs);
      }
      case 'combineLatestWith': {
        /**
         * parameters: propertyName1,propertyName2,...propertyNameN
         */
        const obs = paramsAsPropNames();
        if (obs) {
          return combineLatestWith(obs)(sourceObs);
        }
        break;
      }
      case 'concatAll': {
        return concatAll()(sourceObs);
      }
      case 'debounce': {
        /**
         * parameters: string, durationSelector
         */
        if (typeof parameters === 'string') {
          return debounce(()=> m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'debounceTime': {
        /**
         * parameters: {
         *   due: number,
         *   scheduler: string
         * }
         */
        const due = typeof parameters?.due === 'number' ? parameters?.due : 0;
        return debounceTime(due, paramsAsScheduler(parameters?.scheduler))(sourceObs);
      }
      case 'delay': {
        /**
         * parameters: {
         *   due: number,
         *   scheduler: string
         * }
         */
        const due = typeof parameters?.due === 'number' ? parameters?.due : 0;
        return delay(due, paramsAsScheduler(parameters?.scheduler))(sourceObs);
      }
      case 'delayWhen': {
        /**
         * parameters: string,
         */
        const selector = typeof parameters === 'string' ? m.properties[parameters] : undefined;
        if (selector) {
          return delayWhen(() => selector)(sourceObs);
        }
        break;
      }
      case 'distinct': {
        /**
         * parameters: {
         *  keySelector: string (lodash get()),
         *  flushes: string
         * },
         */
        const keySelector = typeof parameters?.keySelector === 'string' ? (v: any) => _.get(v, parameters.keySelector) : undefined;
        const flushes = typeof parameters?.flushes === 'string' ? m.properties[parameters.flushes] : undefined;
        return distinct(keySelector, flushes)(sourceObs);
      }
      case 'elementAt': {
        /**
         * parameters: {
         *  index: number,
         *  defaultValue?: any
         * },
         */
        return elementAt(parameters?.index?? 0, parameters?.defaultValue)(sourceObs);
      }
      case 'pairwise': {
        return pairwise()(sourceObs);
      }
      case 'observeOn': {
        return observeOn(paramsAsScheduler())(sourceObs);
      }
      case 'raceWith': {
        const obs = paramsAsPropNames();
        if (obs) {
          return raceWith(obs)(sourceObs);
        }
        break;
      }
      case 'repeat': {
        return repeat(typeof parameters === 'number'? parameters : undefined)(sourceObs);
      }
      case 'retry': {
        return retry(typeof parameters === 'number'? parameters : undefined)(sourceObs);
      }
      case 'sample': {
        if (typeof parameters === 'string') {
          return sample(m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'sampleTime': {
        /**
         * parameters: {
         *   period: number,
         *   scheduler: string
         * }
         */
        const period = typeof parameters?.period === 'number' ? parameters.period : 1;
        return sampleTime(period, paramsAsScheduler(parameters?.scheduler))(sourceObs);
      }
      case 'skip': {
        return skip(typeof parameters?.period === 'number' ? parameters.period : 1)(sourceObs);
      }
      case 'skipUntil': {
        if (typeof parameters === 'string') {
          return skipUntil(m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'subscribeOn': {
        /**
         * parameters: {
         *   scheduler: string,
         *   delay: number
         * }
         */
        return subscribeOn(paramsAsScheduler(parameters?.scheduler), typeof parameters?.delay === 'number' ? parameters.delay : 0)(sourceObs);
      }
      case 'switchAll': {
        return switchAll()(sourceObs);
      }
      case 'take': {
        return take(typeof parameters?.period === 'number' ? parameters.period : 1)(sourceObs);
      }
      case 'takeUntil': {
        if (typeof parameters === 'string') {
          return takeUntil(m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'tapLog': {
        return tap(v => {
          console.log(v);
        })(sourceObs);
      }
      case 'throttle': {
        if (typeof parameters === 'string') {
          return throttle(() => m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'throttleTime': {
        /**
         * parameters: {
         *   duration: number,
         *   scheduler: string
         * }
         */
        const duration = typeof parameters?.due === 'number' ? parameters?.due : 0;
        return throttleTime(duration, paramsAsScheduler(parameters?.scheduler))(sourceObs);
      }
      case 'timeInterval': {
        return timeInterval(paramsAsScheduler(parameters))(sourceObs);
      }
      case 'timeout': {
        /**
         * parameters: {
         * // The time allowed between values from the source before timeout is triggered.
         * each?: number;
         * // The relative time as a `number` in milliseconds, or a specific time as a `Date` object,
         * // by which the first value must arrive from the source before timeout is triggered.
         * first?: number | Date;
         * // The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
         * scheduler?: SchedulerLike;
         * // A factory used to create observable to switch to when timeout occurs. Provides
         * // some information about the source observable's emissions and what delay or
         * //exact time triggered the timeout.
         * with?: (info: TimeoutInfo<T, M>) => O;
         */
        const conf = {
          each: typeof parameters?.each === 'number' ? parameters?.due : undefined,
          first: typeof parameters?.first === 'number' ? parameters?.due : undefined,
          scheduler: paramsAsScheduler(parameters?.scheduler),
          with: typeof parameters?.with === 'string' ? () => m.properties[parameters.with] : undefined
        }
        return timeout(conf)(sourceObs);
      }
      case 'timestamp': {
        return timestamp()(sourceObs);
      }
      case 'window': {
        if (typeof parameters === 'string') {
          return windowRxjs(m.properties[parameters])(sourceObs);
        }
        break;
      }
      case 'windowCount': {
        /**
         * parameters: {
         *   windowSize: number,
         *   startWindowEvery?: number
         * }
         */
        if (typeof parameters?.windowSize === 'number') {
          const startWindowEvery = typeof parameters?.startWindowEvery === 'number' ? parameters.startWindowEvery : undefined;
          return windowCount(parameters.windowSize, startWindowEvery)(sourceObs);
        }
        break;
      }
      case 'windowTime': {
        /**
         * parameters: {
         *  windowTimeSpan: number,
         *  windowCreationInterval: number | null | void,
         *  maxWindowSize: number,
         *  scheduler?: SchedulerLike
         * }
         */
        if (typeof parameters?.windowTimeSpan === 'number') {
          const windowCreationInterval = typeof parameters?.windowCreationInterval === 'number' ? parameters.windowCreationInterval : undefined;
          const maxWindowSize = typeof parameters?.maxWindowSize === 'number' ? parameters.maxWindowSize : undefined;
          const scheduler = typeof parameters?.scheduler === 'string' ? paramsAsScheduler(parameters.scheduler) : undefined;
          return windowTime(parameters.windowTimeSpan, windowCreationInterval, maxWindowSize, scheduler)(sourceObs);
        }
        break;
      }
      case 'windowToggle': {
        /**
         * parameters: {
         *   openings: string,
         *   closing: string,
         * }
         */
        const openings = typeof parameters?.openings === 'string' ? m.properties[parameters.openings] : undefined;
        const closing = typeof parameters?.closing === 'string' ? m.properties[parameters.closing] : undefined;
        if (openings && closing) {
          return windowToggle(openings, () => closing)(sourceObs);
        }
        break;
      }
      case 'windowWhen': {
        /**
         * parameters: string
         */
        const closing = typeof parameters === 'string' ? m.properties[parameters] : undefined;
        if (closing) {
          return windowWhen(() => closing)(sourceObs);
        }
        break;
      }
      case 'withLatestFrom': {
        const obs = paramsAsPropNames();
        if (obs) {
          return raceWith(obs)(sourceObs);
        }
        break;
      }
    }
  }
  return EMPTY;
}
