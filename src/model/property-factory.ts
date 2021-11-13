import {EnginePropertyFunc, PropertySource} from "./model";
import {of} from "rxjs";
import {echo, asJsonObject, asString, ifElse, sSwitch, setProperty, rxjsObservable, rxjsOperator} from './properties';

const KNOWN_CLASS: {[key: string]: EnginePropertyFunc} = {
  stringBuilder: echo,
  asJsonObject, asString, ifElse, sSwitch, setProperty,
  rxjsObservable,
  rxjsOperator,
}
export function defaultPropertyFactory(v: PropertySource): EnginePropertyFunc {
  return KNOWN_CLASS[v.$class] || of;
}

