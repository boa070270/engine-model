import {EngineModel, EngineProperty, PropertySource} from "../../model";
import {combineLatest, EMPTY, map, Observable, of} from "rxjs";

export const makeStringBuilder = (m: EngineModel, s: string): Observable<string> => {
  const keyRg = /\${([a-z][0-9A-Za-z]*)}/g;
  const depends = [];
  let inx = 0;
  let pos = 0;
  do {
    const r = keyRg.exec(s);
    if (!r) {
      break;
    }
    depends[inx++] = of(s.substring(pos, keyRg.lastIndex - r[0].length));
    if (m.properties[r[1]]) {
      depends[inx++] = m.properties[r[1]];
    } else {
      depends[inx++] = of(r[0]);
    }
    pos = keyRg.lastIndex;
  } while (true);
  if (depends.length > 0) {
    if (pos < s.length) {
      depends[inx++] = of(s.substring(pos));
    }
    return combineLatest(depends).pipe(map(d => d.join(''))); // TODO check if is any memory leek there
  } else {
    return of(s);
  }
};

export const echo = (m: EngineModel, b: PropertySource): EngineProperty<any> => typeof b.data === 'string' ? makeStringBuilder(m, b.data) : EMPTY;
