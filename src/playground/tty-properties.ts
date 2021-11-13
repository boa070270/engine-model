import {ReadStream, WriteStream} from 'tty';
import {EngineModel, EngineProperty, EnginePropertyFunc, PropertySource} from "engine-model";
import {EMPTY, Observable, of, Subscription} from "rxjs";
import {propertyNamesToPropertyArrays} from "../model/properties";

const rs: ReadStream = process.stdin;
const ws: WriteStream = process.stdout;

const TTYRead = new Observable(subscriber => {
  rs.on('data', data => {
    subscriber.next(data);
  });
});

const RsOfTTYRead = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return new Observable(subscriber => {
    const subs = TTYRead.subscribe(v => subscriber.next(v));
    return {
      unsubscribe() {
        subs.unsubscribe();
      }
    }
  });
}

const RsOfTTYIsRaw = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(rs.isRaw);
}
const RsOfTTYIsTTY = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(rs.isTTY);
}
const RsOfTTYSetRawMode = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  if (typeof s.data === 'boolean') {
    return of(rs.setRawMode(s.data));
  }
  return EMPTY
}
const WsOfTTYResize = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return new Observable(subscriber => {
    ws.on('resize', () => {
      subscriber.next([process.stdout.columns, process.stdout.rows]);
    });
  });
}
const WsOfTTYClearLine = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  if (typeof s.data === 'number' && [-1,0,1].includes(s.data)) {
    return new Observable(subscriber => {
      ws.clearLine(s.data, () => subscriber.next(true));
    });
  }
  return EMPTY;
}
const WsOfTTYClearScreenDown = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return new Observable(subscriber => {
    ws.clearScreenDown(() => subscriber.next(true));
  });
}
const WsOfTTYColumns = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(ws.columns);
}
const WsOfTTYRows = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(ws.rows);
}
const WsOfTTYCursorTo = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  const data = s.data;
  if (typeof data === 'object' && typeof data.x === 'number') {
    const x = data.x;
    const y = typeof data.y === 'number' ? data.y : undefined;
    return new Observable(subscriber => {
      ws.cursorTo(x, y, () => subscriber.next(true));
    });
  }
  return EMPTY;
}
const WsOfTTYGetColorDepth = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(ws.getColorDepth());
}
const WsOfTTYGetWindowSize = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(ws.getWindowSize());
}
const WsOfTTYHasColors = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  const count = typeof s.data === 'number' ? s.data : undefined;
  return of(ws.hasColors(count));
}
const WsOfTTYIsTTY = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  return of(ws.isTTY);
}
const WsOfTTYMoveCursor = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  if (typeof s.data === 'object') {
    const dx = typeof s.data.dx === 'number' ? s.data.dx : 0;
    const dy = typeof s.data.dy === 'number' ? s.data.dy : 0;
    return new Observable(subscriber => {
      ws.moveCursor(dx, dy, () => subscriber.next(true));
    });
  }
  return EMPTY;
}
const WsOfTTYWrite = (m: EngineModel, s: PropertySource): EngineProperty<any> => {
  const p = s.data?.property;
  const encoding = s.data?.encoding?? undefined;
  if (typeof p === 'string') {
    return new Observable(subscriber => {
      const subs = new Subscription();
      subs.add(m.properties[p].subscribe(v => {
        if (typeof v === 'string') {
          ws.write(v, encoding, (err) => {
            if (err) {
              subscriber.error(err);
            } else {
              subscriber.next(true);
            }
          });
        } else if (Buffer.isBuffer(v)){
          ws.write(v, (err) => {
            if (err) {
              subscriber.error(err);
            } else {
              subscriber.next(true);
            }
          });
        } else {
          // unknown data
          subscriber.next(false);
        }
      }));
      return {
        unsubscribe() {
          subs.unsubscribe();
        }
      }
    });
  }
  return EMPTY;
}
export const TTY_PROPERTIES: {[key: string]: EnginePropertyFunc} = {
  RsOfTTYRead,
  RsOfTTYIsRaw,
  RsOfTTYIsTTY,
  RsOfTTYSetRawMode,
  WsOfTTYClearLine,
  WsOfTTYClearScreenDown,
  WsOfTTYIsTTY,
  WsOfTTYColumns,
  WsOfTTYRows,
  WsOfTTYCursorTo,
  WsOfTTYGetWindowSize,
  WsOfTTYGetColorDepth,
  WsOfTTYHasColors,
  WsOfTTYMoveCursor,
  WsOfTTYResize,
  WsOfTTYWrite
}
