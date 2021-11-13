import {AsyncSubject, Observable} from "rxjs";

/**
 * Engine Model - it is a set of properties, where every property has a name and can be dependent on other properties.
 */
export interface EngineModel {
  parent?: EngineModel;
  environment?: EngineEnvironment;
  properties: EngineProperties;
  asyncSubject: AsyncSubject<any>;
  destroy: () => void;
}
export interface EngineEnvironment {
  propertyFactory?: (v: PropertySource) => EnginePropertyFunc;
  debugFnc?: (name: string, next: any, source?: PropertySource) => void;
}
export interface EngineProperty<T> extends Observable<T> {
  init?: (m: EngineModel) => Observable<void>;
  enginePropertyCfg?: string; // TODO Do I need to store original prototype?
  dispose?: () => Observable<void>;
}
export interface EngineProperties {
  [name: string]: EngineProperty<any>;
}
export interface PropertySource {
  $class: string; // class name for this property
  data: any; // property's configuration
}
export type EnginePropertyFunc = (m: EngineModel, v: PropertySource) => EngineProperty<any>;
