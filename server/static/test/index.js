// import * as t1 from './use.js'
import { post } from '../js/web/util.js';

post('/hello', {
  type: 'test',
  message: 'test-message',
}).then(value => {
  console.log(value);
});
