import { Middler, Event } from '../js/util.js';

function test1 () {
  const m = new Middler();

  m.use((ctx, next) => {
    console.log('m1 s');
    next();
    console.log('m1 e');
  }, (ctx, next) => {
    console.log('m2 s');
    next();
    console.log('m2 e');
  }).use((ctx, next) => {
    console.log('m3 s');
    next();
    console.log('m3 e');
  });

  m.use((ctx, next) => {
    console.log('m4 s');
    next();
    console.log('m4 e');
  });

  const comp = m.compose({msg: 'test'});

  comp((info) => {
    console.log('center');
    console.log(info);
  })
}

function test2 () {
  const e = new Event();

  e.on('a', (value) => {
    console.log({value})
  });
  e.on('a', (value, opts) => {
    console.log({value, opts});
  });

  e.use((ctx, next) => {
    console.log({ctx, next});
    next();
  });

  e.emit('a');
  e.emit('a', 0);
  e.emit('a', 0, {a: 1});
}

function test3 () {
  const f = function* (blocking1, blocking2, blocking3) {
    console.log('stage 1');
    yield blocking1;
    console.log('stage 2');
    yield blocking2;
    console.log('stage 3');
    yield blocking3;
    console.log('stage 4');
  }
  const result = Middler.divide(f);
  const [f1, f2, f3, f4] = result;
  console.log(result);
  console.log('before f1');
  f1();
  console.log('after f1');
  console.log('before f2');
  f2();
  console.log('after f2');
  console.log('before f3');
  f3();
  console.log('after f3');
  console.log('before f4');
  f4();
  console.log('after f4');
  return 3;
}

