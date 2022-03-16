import { dec } from '../js/declaration.js';
import { use, computed, Type } from '../js/use.js';

const div = dec('div');
const header = dec('header');

const root = document.querySelector('#root');
// root.append(middle);

function test () {
  const { meta, data } = use({
    a: 1, b: 2, c: { a: 1, b: 2}
  });

  const t = computed(meta.a, meta.b)((a, b) => ({ a, b }));

  // t((v) => console.log({id: 1, v}));
  // t((v) => console.log({id: 2, v}));

  console.log(t instanceof Type.Meta);


  // data.a = 5;
  // data.b = 4;

  meta.c(v => console.log({'meta.c': v}));

  // meta.c.a(v => console.log({'meta.c.a': v}));

  data.c.a = 2;
  // data.c.b = 4;

  // data.c = 1;

}

function test2 () {
  const { meta, data } = use([1,2,3,4,5]);

  console.log(data[0]);

  meta[0](v => console.log({ v }));

  data[0] = { a: 1, b: 2 };
}

function test3 () {
  const range = function* (upper) {
    for (let i = 0; i < upper; i ++) {
      yield i;
    }
  }

  for (const i of range(10)) {
    console.log({ i });
  }
}

function test4 () {
  const ul = dec('ul');
  const li = dec('li');

  const comp = div () (
    header () (
      dec ('h2') (' title ')
    ),
    ul () (
      ...Array(5).fill(0).map((v, i) => li () (` - item - ${ i }`)),
    ),
    div () ()
  )

  root.append(comp);
}

test();
