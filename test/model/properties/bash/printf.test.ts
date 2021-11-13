import {parseText, PTOKEN} from '../../../../src';
import {expect} from "chai";

describe('printf', () => {
  describe('check printf token', () => {
    it('found it text', () => {
      const txt = `Hello %d, %%d, %{ddd}d, %5$d, %5&d % 5d %+5d %05d %-5d %.2f %06.2f %c %c %d%% +%s+ %c printf("%2$*1$d", width, num)
    debug: %O '%2$s: %1$O Debug: %.1O %O %#O %+O %{temperature}s %{crevace}ss %2$s %1$ss %*s %*.*f  %0*.*f  %-*.*f
    printf("%1$d:%2$.*3$d:%4$.*3$d\\n", hour, min, precision, sec)
    Hello %d, %%d, %{ddd}d, %5$d, %5&d % 5d %+5d %05d %-5d %.2f %06.2f %c %c %d%% +%s+ %c printf("%2$*1$d", width, num);
    debug: %O '%2$s: %1$O Debug: %.1O %O %#O %+O %{temperature}s %{crevace}ss %2$s %1$ss %*s %*.*f  %0*.*f  %-*.*f
    printf("%1$d:%2$.*3$d:%4$.*3$d\\n", hour, min, precision, sec)
    Hello %d, %%d, %{ddd}d, %5$d, %5&d % 5d %+5d %05d %-5d %.2f %06.2f %c %c %d%% +%s+ %c printf("%2$*1$d", width, num);
    debug: %O '%2$s: %1$O Debug: %.1O %O %#O %+O %{temperature}s %{crevace}ss %2$s %1$ss %*s %*.*f  %0*.*f  %-*.*f
    printf("%1$d:%2$.*3$d:%4$.*3$d\\n", hour, min, precision, sec)
    Hello %d, %%d, %{ddd}d, %5$d, %5&d % 5d %+5d %05d %-5d %.2f %06.2f %c %c %d%% +%s+ %c printf("%2$*1$d", width, num);
    debug: %O '%2$s: %1$O Debug: %.1O %O %#O %+O %{temperature}s %{crevace}ss %2$s %1$ss %*s %*.*f  %0*.*f  %-*.*f
    printf("%1$d:%2$.*3$d:%4$.*3$d\\n", hour, min, precision, sec)
    Hello %d, %%d, %{ddd}d, %5$d, %5&d % 5d %+5d %05d %-5d %.2f %06.2f %c %c %d%% +%s+ %c printf("%2$*1$d", width, num);
    debug: %O '%2$s: %1$O Debug: %.1O %O %#O %+O %{temperature}s %{crevace}ss %2$s %1$ss %*s %*.*f  %0*.*f  %-*.*f
    printf("%1$d:%2$.*3$d:%4$.*3$d\\n", hour, min, precision, sec)`;
      let res: RegExpExecArray | null;
      const reg = new RegExp(PTOKEN);
      let i = -1;
      const start = Date.now();
      for (let k = 0; k < 10; k++) {
        do {
          if (k === 0) {
            i++;
          }
          res = reg.exec(txt);
          if (i < 33) {
            if (res) {
              /* 0 - the format string
              * 1 - the name of field or its number
              * 2 - the flags
              * 3 - the width
              * 4 - the precision
              * ? - the length modifier is skipped
              * 5 - the conversion specifier
              */
              console.log(`================== ${i} ==========================`);
              console.log(`0. The format string: (${res[0]})`);
              console.log(`1. The name of field or its number: (${res[1]})`);
              console.log(`2. The flags: (${res[2]})`);
              console.log(`3. The width: (${res[3]})`);
              console.log(`4. the precision with comma: (${res[4]})`);
              console.log(`5. The precision: (${res[5]})`);
              //* ? - the length modifier is skipped
              console.log(`6. The conversion specifier: (${res[6]})`);
            } else {
              console.log('NULL');
            }
          }
        } while (res);
      }
      expect(i).equal(165);
      expect(Date.now() - start).lessThan(20);
    });
    it('The name of field or its number', () => {
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[1]).undefined;
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%{ddd}'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[1]).equal('{ddd}');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%1$'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[1]).equal('1$');
        }
      }
    });
    it('Negative: The name of field or its number', () => {
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%{ddd$}'+spec;
        const res = reg.exec(t1);
        expect(res).not.exist;
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%k$'+spec;
        const res = reg.exec(t1);
        expect(res).not.exist;
      }
    });
    it('The flags', () => {
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal('');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%{ddd}'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal('');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%1$'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal('');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%1'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal('');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%-1'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal('-');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%-01'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal('-0');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% -#\'01'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal(' -#\'0');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%1$ -#\'0*'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal(' -#\'0');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%{param} -#\'0*'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[2]).equal(' -#\'0');
        }
      }
    });
    it('The width', () => {
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).undefined;
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%{ddd}'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).undefined;
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%1$'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).undefined;
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%-1'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).equal('1');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 01'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).equal('1');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 0*'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).equal('*');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 0*1$'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[3]).equal('*1$');
        }
      }
    });
    it('The precision', () => {
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%.'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.');
          expect(res[5]).undefined;
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%.0'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) {
          expect(res[4]).equal('.0');
          expect(res[5]).equal('0');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%{ddd}.5'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.5');
          expect(res[5]).equal('5');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%1$.5'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.5');
          expect(res[5]).equal('5');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '%-1.5'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.5');
          expect(res[5]).equal('5');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 01.*'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.*');
          expect(res[5]).equal('*');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 0*.*'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.*');
          expect(res[5]).equal('*');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 0*1$.*1$'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.*1$');
          expect(res[5]).equal('*1$');
        }
      }
      for (const spec of 'diouxXeEfFgGaAcpncsO') {
        const reg = new RegExp(PTOKEN);
        const t1 = '% - 0*1$.*1$'+spec;
        const res = reg.exec(t1);
        expect(res).exist;
        if (res) { // is checked
          expect(res[4]).equal('.*1$');
          expect(res[5]).equal('*1$');
        }
      }
    });
  });
  describe('makeFnc', () => {
    describe('Width', () => {
      // Width: (every specifier has the same behavior)
      it('to pad with spaces on the left in a case converted value shorter', () => {
        const tmp = '%10d;%1$*d;%{num}*d;';
        const f = parseText(tmp);
        const s = f([5, 10, 3],{num: 6});
        expect(s).equal('         5;         5;  6;');
      });
    });
  });
  /*
    Width: (every specifier has the same behavior)
      to pad with spaces on the left in a case converted value shorter
      takes a direct digit string and a value determined by "*" or "*m$"
      negative value (-) sets flag '-'
      incorrect value is skipped // TODO
    Precision:
      takes a direct digit string and a value determined by "*" or "*m$"
      empty precision (only '.') or negative or incorrect = 0
      Specifiers:
        d, i, o, u, x,X - minimum number of digits
        a,A, e,E, f,F - number of digits after the radix
        g,G - the maximum number of significant digits
        s, S - maximum number of characters
        c - unaffected
    Flags:
      '#':
        'o' - prefix 0 if it was not zero already
        'xX' - a nonzero result has the prefix "0x" | "0X"
        'a, A, e, E, f, F, g, and G' - always contain a decimal point
        'g, G' - trailing zeros are not removed from the result
        'O' - print not enumerable properties
      '0':
        If the 0 and - flags both appear, the 0 flag is ignored.
        If a precision is given with a numeric conversion (d, i, o, u, x, and X), the 0 flag is ignored
        d, i, o, u, x, X, a, A, e, E, f, F, g, G - the converted value is padded on the left with zeros rather than blanks
      '-':
        print left adjusted
      ' ':
        space before a positive number
      '+':
        always prints sign before number
      '\'':
        i, d, u, f, F, g, G - grouped with thousands' grouping character
      '=':
        print center adjusted
    Default:
      Uses right justification.
      'a, A, e, E, f, F, g, and G' - a decimal point appears in the results of those conversions only if a digit follows
      'g, G' - trailing zeros removed from the result

    'd, i':
       - precision determines the minimum number of digits that must appear.
       - the default precision is 1.
       - when 0 is printed with an explicit precision 0, the output is empty.
    'o, u, x, X':
       - Unsigned
       - 'X' gives uppercase result
       - precision determines the minimum number of digits that must appear.
       - the default precision is 1.
       - when 0 is printed with an explicit precision 0, the output is empty.
    'e, E':
       - one digit before the decimal-point
       - the number of digits after decimal-point is equal to the precision
       - if the precision is missing, it is taken as 6
       - if the precision is explicitly zero, no decimal-point character appear
       - "E" prints the letter E to introduce the exponent
       - the exponent always contains at least two digits
       - if the value is zero, the exponent is 00
    'f, F':
       - "f" prints "[-]inf" or "[-]infinity" and "nan" for NaN
       - "F" prints "[-]INF" or "[-]INFINITY" or "NAN"
       - the number of digits after the decimal-point character is equal to the precision
       - if the precision is missing, it is taken as 6
       - if the precision is explicitly zero, no decimal-point character appear
       - if a decimal point appears, at least one digit appears before it.
    'g, G':
       - The precision specifies the number of significant digits
       - if the precision is missing, it is taken as 6
       - if the precision is zero, it is treated as 1
       - style e is used if the exponent from its conversion is less than -4 or greater than or equal to the precision
       - trailing zeros are removed from the fractional part of the result
       - a decimal point appears only if it is followed by at least one digit
    'a, A':
       - argument is converted to hexadecimal notation [-]0xh.hhhhpe±
       - for A conversion the prefix 0X, the letters ABCDEF, and the exponent separator P is used
       - one hexadecimal digit before the decimal point
       - the number of digits after decimal-point is equal to the precision

   */
});
