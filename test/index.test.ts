import {
  concat,
  from,
  interval, Observable,
  of,
  skipUntil,
  subscribeOn,
  Subscription,
  takeUntil,
  timer,
  VirtualTimeScheduler
} from 'rxjs';

function sleep(ms: number): Promise<any> {
  return new Promise<any>(resolve => {
    setTimeout(resolve, ms);
  });
}
describe('Engine-model', () => {
  it('test 1', async () => {
    const o1 = interval(100);
    const subs = new Subscription();
    subs.add(o1.subscribe(v => {
      console.log('original: '+ v);
    }));
    const toggle = timer(500);
    subs.add(skipUntil(toggle)(o1).subscribe(v => {
      console.log('skipUntil: '+ v);
    }));
    subs.add(takeUntil(toggle)(o1).subscribe(v => {
      console.log('takeUntil: '+ v);
    }));
    await sleep(1000);
    subs.unsubscribe();
  });
  it('test of|from', async () => {
    const o1 = of([1,2,3,4,5]);
    const o2 = of([6,7,8,9,10]);
    const o3 = of('Hello');
    const o4 = of('World');
    const o5 = of(true);
    const o6 = of(NaN);
    const subs = new Subscription();
    const fr = new Observable(subscriber => {
      subs.add(concat(o1, o2, o3, o4).subscribe(a => {
        subs.add(from(a).subscribe(f => subscriber.next(f)));
      }))
    });
    subs.add(fr.subscribe(v => {
      console.log(v);
    }));
    await sleep(1000);
    subs.unsubscribe();
  });
});
