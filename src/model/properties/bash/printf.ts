import {EngineModel, EngineProperty, PropertySource} from "../../model";
import {combineLatest, EMPTY, map, Observable, of} from "rxjs"
import * as _ from 'lodash';

function toNumber(s: any): BigInt | number {
  if (typeof s === 'bigint' || typeof s === 'number') {
    return s;
  } else if (typeof s === 'string') {
    switch (s[0]) {
      case '0':
        if (s[1] === 'X' || s[1] === 'x') {
          return parseInt(s, 16);
        }
        if (s[1] === 'B' || s[1] === 'b') {
          return parseInt(s, 2);
        }
        return parseInt(s, 8);
      case '"':
      case '\'':
        return s.charCodeAt(1);
      default:
        return +s;
    }
  }
  return NaN;
}
function isNumberSpecifier(s: string): boolean {
  return 'diouxXeEfFgGaAcpn'.includes(s);
}
function is0(n: any): boolean {
  if (typeof n === 'number' || typeof n === 'bigint') {
    return typeof n === 'number' && !isNaN(n) ? !Math.round(n) : n === 0n;
  }
  return false;
}
function l0(n: any): boolean {
  if (typeof n === 'number' || typeof n === 'bigint') {
    return typeof n === 'number' ? n < 0 : n < 0n;
  }
  return false;
}
function abs(n: any) {
  return typeof n === 'bigint' ? n < 0n ? n * -1n : n : Math.abs(n);
}
/**
 * 0 - the format string
 * 1 - the name of field or its number - ([1-9]\d*\$|\{[\w_.]+\})?
 * 2 - the flags - ([-+= '#0]*)
 * 3 - the width - (\*[1-9]\d*\$|\*|\d+)?
 * 4 - the precision with comma - (\.(\*[1-9]\d*\$|\*|\d*)?
 * 5 - the precision
 * ? - the length modifier is skipped
 * 6 - the conversion specifier - ([diouxXeEfFgGaAcspnmO])
 */
export const PTOKEN = /(?<!%)%([1-9]\d*\$|\{[\w_.]+\})?([-+= '#0]*)(\*[1-9]\d*\$|\*|\d+)?(\.(\*[1-9]\d*\$|\*|\d*)?)?([diouxXeEfFgGaAcspnmO])/g;

function makeFnc(res: RegExpExecArray,
                 dest: Array<string>,
                 destInx: number,
                 pIndex: number, skipParams: (i: number) => void,
                 locale= 'UA'): (paramsAsArray: Array<any>, params: {[key: string]: any}, locale?: string) => void {
  const [inPattern, inField, inFlags, inWidth, inDotPrecision, inPrecision, inConversion] = res;
  function mkWP(what: string): ((paramsAsArray: Array<any>, params: {[key: string]: any}) => number) | void {
    if (what) {
      if (what.charAt(0) !== '*') {
        return (paramsAsArray: Array<any>, params: {[key: string]: any}) => +what;
      } else {
        const idx = what.length === 1 ? pIndex++ : +what.substring(1, what.length);
        return (paramsAsArray: Array<any>, params: {[key: string]: any}) => +paramsAsArray[idx];
      }
    }
  }
  function mkSource(conversion: string): (paramsAsArray: Array<any>, params: {[key: string]: any}) => any {
    const wrapFnc = isNumberSpecifier(conversion) ? (v: any) => toNumber(v) : (v: any) => v;
    if (inField && inField.charAt(0) === '{') {
      const fld = inField.substring(1, inField.length - 1);
      return (paramsAsArray: Array<any>, params: {[key: string]: any}) => wrapFnc(params[fld]);
    } else {
      const idx = inField? +inField.substring(0, inField.length - 1) : pIndex++;
      return (paramsAsArray: Array<any>, params: {[key: string]: any}) => wrapFnc(paramsAsArray[idx]);
    }
  }
  const width = mkWP(inWidth);
  const precision = mkWP(inPrecision);
  const source = mkSource(inConversion);
  skipParams(pIndex);
  const dynValue = (paramsAsArray: Array<any>, params: {[key: string]: any}) => [
    width? Math.abs(width(paramsAsArray, params)) || undefined : undefined,
    precision? precision(paramsAsArray, params) || inDotPrecision? 0 : undefined : undefined,
    source(paramsAsArray, params)
  ];
  // let result = (paramsAsArray: Array<any>, params: {[key: string]: any}) => source(paramsAsArray, params);
  const [fAlternateForm, f0, fLeftAdjust, fSpace, fSign, fThousandsGrouping, fPads] = !inFlags? [] :
    [inFlags.includes('#'), inFlags.includes('0') && !inFlags.includes('-') && !(inDotPrecision && 'diouxX'.includes(inConversion)),
      inFlags.includes('-'), inFlags.includes(' ') && !inFlags.includes('+'), inFlags.includes('+'),
      inFlags.includes('\'') && 'i, d, u, f, F, g, G'.includes(inConversion), inFlags.includes('=')];
  function format(ts: (v: any, p: number) => string, pc: (p: number) => string | undefined = () => undefined) {
    return (paramsAsArray: Array<any>, params: { [key: string]: any }) => {
      const [w, p, v] = dynValue(paramsAsArray, params);
      const pad = fPads ? _.pad : fLeftAdjust || l0(w) ? _.padEnd : _.padStart;
      dest[destInx] = pad(ts(v, p), w, pc(p));
    }
  }
  function pad0Left(s: string, p: number): string {
    if (p > 0) {
      if (s.startsWith('-')) {
        return _.padStart(s.substring(1), p, '0');
      } else {
        return _.padStart(s, p, '0');
      }
    }
    return s;
  }
  function pad0Right(s: string, p: number): string {
    if (p > 0) {
      return _.padStart(s, p, '0');
    }
    return s;
  }
  if ('c' === inConversion) {
    return format((v, p) => String.fromCharCode(v).substring(0, Math.min(Number.MAX_VALUE, p)));
  } else if ('u' === inConversion) {
    return format((v, p) => {
      const nf = new Intl.NumberFormat('UA',
        {minimumIntegerDigits: p, useGrouping: fThousandsGrouping, maximumFractionDigits: 0}
      );
      return nf.format(abs(v));
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('di'.includes(inConversion)) {
    return format((v, p) => {
      const nf = new Intl.NumberFormat('UA',
        {minimumIntegerDigits: p, useGrouping: fThousandsGrouping, maximumFractionDigits: 0}
      );
      return nf.format(v);
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('fF'.includes(inConversion)) {
      return format( (v, p) => {
        const nf = new Intl.NumberFormat('UA',
          { minimumIntegerDigits: 1, useGrouping: fThousandsGrouping, minimumFractionDigits: p === 0? 0 : 1, maximumFractionDigits: p? p : 6 }
        );
        return nf.format(v);
      }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('gG'.includes(inConversion)) {
    return format( (v, p) => {
      const nf = new Intl.NumberFormat('UA',
        { minimumIntegerDigits: 1, useGrouping: fThousandsGrouping, minimumFractionDigits: 1, maximumFractionDigits: p? p : 6 }
      );
      return nf.format(v);
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('xX'.includes(inConversion)) {
    return format((v, p) => {
      if (!isNaN(v)) {
        let s = abs(v).toString(16);
        //TODO
        return s;
      }
      return 'NaN';
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('aA'.includes(inConversion)) {
    return format((v, p) => {
      if (!isNaN(v)) {
        let s = (v as number).toString(16);
        //TODO
        return s;
      }
      return 'NaN';
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('o' === inConversion) {
    return format((v, p) => {
      // TODO
      return (v as number).toString(8);
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('eE'.includes(inConversion)) {
    return format((v, p) => {
      return (v as number).toExponential(p? p : 6); // TODO
    }, (p) => (f0 && !(p >= 0))? '0' : undefined);
  } else if ('s' === inConversion) {
    return (paramsAsArray: Array<any>, params: { [key: string]: any }) => {
      const [w, p, v] = dynValue(paramsAsArray, params);
      const pad = fPads ? _.pad : fLeftAdjust || l0(w) ? _.padEnd : _.padStart;
      dest[destInx] = pad(v.substring(0, Math.min(Number.MAX_VALUE, p)), w);
    }
  }
  return function (p1: Array<any>, p2: { [p: string]: any }) {
    dest[destInx] = 'Unknown format';
  };
}

export function parseText(format: string): (paramsAsArray: Array<any>, params: {[key: string]: any}) => string {
  const ss: Array<string> = [];
  const ff: Array<(paramsAsArray: Array<any>, params: {[key: string]: any}) => void> = [];
  const rg = new RegExp(PTOKEN);
  let ssIndex = 0, ffIndex = 0, lastIndex = 0, pIndex = 1; // we count parameters from 1 to correctly use '1$' mapping
  let res: RegExpExecArray | null;
  do {
    res = rg.exec(format);
    if (res) {
      ss[ssIndex++] = format.substring(lastIndex, res? rg.lastIndex - res[0].length : rg.lastIndex);
      lastIndex = rg.lastIndex;
      ff[ffIndex++] = makeFnc(res, ss, ssIndex++, pIndex, (i: number) => {
        pIndex = i;
      });
    } else if (lastIndex < format.length) {
      ss[ssIndex++] = format.substring(lastIndex);
    }
  } while (res);
  return (paramsAsArray: Array<any>, params: {[key: string]: any}) => {
    paramsAsArray.unshift(null);
    ff.forEach(f => f(paramsAsArray, params));
    return ss.join('');
  };
}
