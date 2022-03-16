// const context = { b: { c: 1 } };

// const { effect: { event, log } } = context;

function Component (context) {
  const { src, sink } = context;
  // src['a'].map(e => e.event)
  context.mixIn();

  return (
    div ({}) (
      button ({
        on: { input: sink('a'), },
      }) (),
    )
  )
}

// const a = 1;
// const b = 2;
// const c = 3;

// const full = () => full;

// const result = ((next) => {
//   if (a > 0) {
//     console.log('next 1');
//     return next;
//   } else {
//     console.log('a');
//     return full;
//   }
// })((next) => {
//   if (b > 0) {
//     console.log('next 2');
//     return next;
//   } else {
//     console.log('b');
//     return full;
//   }
// })((next) => {
//   if (c > 0) {
//     console.log('next 3');
//     return next;
//   } else {
//     console.log('c');
//     return full;
//   }
// })(true);

// console.log(result);

// function test (...args) {
//   console.log(args);
// }

// test(a = 1, b = 2, c = 3);
