import {defaultPropertyFactory, PropertySource, SimpleEngineModel} from '../model';
import {TTY_PROPERTIES} from "./tty-properties";

/*
TS_NODE_PROJECT="./tsconfig.json" node --experimental-specifier-resolution=node --loader ts-node/esm ./src/main.ts

 */
const testModel2 = {
  greeting: 'Hello',
  whoOrWhat: 'world',
  builder: {
    $class:'stringBuilder',
    toggle:'toggle',
    data:'You input'},
  ttyRead: {
    $class: 'RsOfTTYRead'
  },
  collect: {
    $class:'stringBuilder',
    data: '${builder} ${ttyRead}',
  },
  ttyWrite: {
    $class: 'WsOfTTYWrite',
    data: {
      property: 'collect',
    }
  }
}
function main() {
  const model = SimpleEngineModel.fromObject(testModel2, undefined, {
    propertyFactory: (v: PropertySource) => {
      if (TTY_PROPERTIES[v.$class]) {
        return TTY_PROPERTIES[v.$class];
      }
      return defaultPropertyFactory(v);
    }
  });
}

main();
