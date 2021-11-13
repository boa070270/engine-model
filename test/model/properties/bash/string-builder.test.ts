// @ts-ignore
import {SimpleEngineModel, PTOKEN} from "../../../../src";
import {expect} from "chai";
import {takeUntil} from "rxjs";

const testModel1 = {
  greeting: 'Hello',
  whoOrWhat: 'world',
  builder: '{"$class":"echo", "toggle":"toggle", "data":"<html>\\n<body>\\n<h1>${greeting} ${whoOrWhat}!!!</h1>\\n</body>\\n</html>"}'
}
const testModel2 = {
  greeting: 'Hello',
  whoOrWhat: 'world',
  builder: {
    $class:'stringBuilder',
    toggle:'toggle',
    data:'<html>\n<body>\n<h1>${greeting} ${whoOrWhat}!!!</h1>\n</body>\n</html>'}
}
describe('string-builder', () => {
  xit('test one', () => {
    let simpleModel = SimpleEngineModel.fromJson(JSON.stringify(testModel1));
    simpleModel.properties['builder'].subscribe(v => {
      expect(v).eq("<html>\n<body>\n<h1>Hello world!!!</h1>\n</body>\n</html>");
    });
    simpleModel = SimpleEngineModel.fromJson(JSON.stringify(testModel2));
    simpleModel.properties['builder'].subscribe(v => {
      expect(v).eq("<html>\n<body>\n<h1>Hello world!!!</h1>\n</body>\n</html>");
    });
  });
});
