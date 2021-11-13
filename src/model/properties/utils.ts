import {animationFrameScheduler, asapScheduler, asyncScheduler, Observable, queueScheduler, SchedulerLike} from "rxjs";
import {EngineModel} from "../model";
import * as _ from 'lodash';

export function propertyNamesToPropertyArrays(m: EngineModel, propertyNames: any): Observable<any>[] | void {
  if (typeof propertyNames === 'string') {
    const properties = propertyNames.split(/\s*,\s*/);
    if (properties.length > 0) {
      const obs: Observable<any>[] = [];
      for (const pName of properties) {
        obs.push(m.properties[pName]);
      }
      return obs;
    }
  }
}
export function schedulerByName(param: any): SchedulerLike {
  let scheduler = asyncScheduler;
  if (typeof param === 'string') {
    switch (param) {
      case 'animationFrameScheduler':
        scheduler = animationFrameScheduler;
        break;
      case 'asapScheduler':
        scheduler = asapScheduler;
        break;
      case 'queueScheduler':
        scheduler = queueScheduler;
        break;
    }
  }
  return scheduler;
}
export const FnCamelToDashCase = (s: string) => s.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
export const FnKebabToCamelCase = (s: string) => s.replace(/-([a-z\d])/g, (_, c) => c.toUpperCase());
/**
 * choiceFormat - return formatted string. The principle is like java.text.ChoiceFormat
 * Rules:
 * There is some text with {0} as number and we want that number with correct plural form, e.g: {0,0# seconds|1# second|(1..)# seconds}
 * {n} - number of inserts params[n]
 * {n,choice|choice|choice} - insert n-th parameter with choice string, the choice has next format:
 * condition#string - where condition can be:
 *    n# - define equal value
 *    (x..y) - range with exclusive borders
 *    [x..y] - range with inclusive borders
 *    Ranges can be (x..y] and [x..y), also range can be defined only with one border (..4]
 * e.g. "It was {0,(..0]-th years|1# year|(1..)-th} ago" wile translated as:
 * 0 : It was 0-th years ago
 * 1 : It was 1 year ago
 * 5 : It was 5-th years ago
 * something like this
 * @param str formatted string
 * @param params - parameters
 */
export function choiceFormat(str: string, ...params: any[]): string {
  return str.replace(/\{\d*.*\}/g, (s: string) => {
    const [num, choices] = s.substring(1, s.length - 1).split(',');
    const param = +num;
    if (!isNaN(param) && params[param] !== undefined) {
      const parameter = trParam(params[param]);
      if (choices) {
        const choice = choices.split('|');
        for (const ch of choice) {
          let res;
          if (ch.startsWith('[') || ch.startsWith('(')) {
            res = parseRangeChoice(parameter, ch);
          } else {
            const i = ch.indexOf('#');
            if (i > 0) {
              // tslint:disable-next-line:triple-equals
              if (parameter == ch.substring(0, i)) {
                res = parameter + ch.substring(i + 1);
              }
            } else if (parameter === '') {
              res = ch.substring(1);
            }
          }
          if (res) {
            return res;
          }
        }
      }
      return parameter;
    }
    return '';
  });
}
function trParam(p: any): any {
  if (typeof p === 'object') {
    if (p === null) {
      return 'null';
    }
    if (p instanceof Error) {
      return `${p.name}: ${p.message}.\n${p.stack}`;
    }
    return JSON.stringify(p);
  }
  if (typeof p === 'function') {
    return `function ${p.name}`;
  }
  return p;
}
function parseRangeChoice(parameter: string, choice: string): string | void {
  const i = choice.search(/[\]\)]/);
  if (i >= 0) {
    const cond = choice.substring(1, i);
    const d = cond.search('..');
    if (d >= 0) {
      const [left, right] = cond.split('..');
      let condinion;
      if (!isNaN(+parameter)) {
        // checks as number
        // @ts-ignore
        // tslint:disable-next-line:max-line-length
        const {pn, ln, rn} = {pn: parameter * 1, ln: left ? left * 1 : Number.MIN_SAFE_INTEGER, rn: right ? right * 1 : Number.MAX_SAFE_INTEGER};
        condinion =
          ((pn >= ln && choice.charAt(0) === '[') || (pn > ln && choice.charAt(0) === '('))
          &&
          ((pn <= rn && choice.charAt(i) === ']') || (pn < rn && choice.charAt(i) === ')'));

      } else {
        condinion =
          // tslint:disable-next-line:max-line-length
          ((left === '' && choice.charAt(0) === '(') || (parameter >= left && choice.charAt(0) === '[') || (parameter > left && choice.charAt(0) === '('))
          &&
          // tslint:disable-next-line:max-line-length
          ((right === '' && choice.charAt(i) === ')') || (parameter <= right && choice.charAt(i) === ']') || (parameter < right && choice.charAt(i) === ')'));
      }
      if (condinion) {
        return parameter + choice.substring(i + 1);
      }
    }
  }
}

/**
 * Like sprintf
 * The associated argument are present as ${VariableName} instead by index. The same name provide the same value.
 * The format is located at the first position and divided by a comma from the associated argument: ${%,VariableName}
 * Format 	Description
 %s 	Interprets the associated argument as string
 %n   Interprets the associated argument as number
 %b 	Interprets the associated argument as boolean
 %o   Interprets the associated argument as object
 %d 	Interprets the associated argument as date

 Modifiers
 To be more flexible in the output of numbers and strings, the printf command allows format modifiers. These are specified between the introducting % and the character that specifies the format:
 printf "%50s\n" "This field is 50 characters wide..."

 Field and printing modifiers
 Field output format
 <N>	Any number: Specifies a minimum field width, if the text to print is smaller, it's padded with spaces, if the text is bigger, the field is expanded
 .	The dot: Together with a field width, the field is not expanded when the text is bigger, the text is cutted instead.
    ”%s.,” is an undocumented equivalent for ”%s.0,”, which will force a field width of zero, effectively hiding the field from output
 #	“Alternative format” for numbers
 -	Left-bound text printing in the field (standard is right-bound)
 0	Pads numbers with zeros, not spaces
 <space>	Pad a positive number with a space, where a minus (-) is for negative numbers
 +	Prints all numbers signed (+ for positive, - for negative)

 Alternative Format
 %n#o	The octal number is printed with a leading zero, unless it's zero itself
 %n#x, %#X	The hex number is printed with a leading ”0x”/”0X”, unless it's zero
 %n#g, %#G	The float number is printed with trailing zeros until the number of digits for the current precision is reached (usually trailing zeros are not printed)

 Precision
 The precision for a floating- or double-number can be specified by using .<DIGITS>, where <DIGITS> is the number of digits for precision.
 printf "%n.10\n" 4,3 => 4,3000000000
 For strings, the precision specifies the maximum number of characters to print (i.e. the maximum field width).
 For integers, it specifies the number of digits to print (zero-padding!).

 * @param s
 * @param params
 */
export function sprintf(s: string, params: {[key: string]: any}): string {
  return '';
}

/**
 * ${%s<<-><DIGITS|propertyName><.DIGITS|propertyName>>>,propertyName}
 * @param format - <<-><DIGITS|propertyName><.DIGITS|propertyName>>>
 * @param params - Map<propertyName,value>
 */
function fstr(variable: string, params: {[key: string]: any}): string {
  if (variable) {
    const [format, property] = variable.split(',');
    if (format) {
      let padRight = format[0] === '-';
      let width, precision;
      if (format.indexOf('.') >= 0) {
        const p = format.split('.');
        width = p[0];
        precision = p[1];
      } else {
        width = format;
      }
      if (typeof +width !== 'number') {
        width = params[padRight ? width.substring(1) : width] || 0;
      }
      if (precision) {
        if (typeof +precision !== 'number') {
          precision = params[precision];
        }
      }
      return padRight? _.padEnd(params[property], width, ' ') : _.padStart(params[property], width, ' ');
    }
    return params[property];
  }
  return '';
}
