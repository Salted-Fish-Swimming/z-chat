const path = require('path');

const Koa = require('koa');
const static = require('koa-static');
const websockify = require('koa-websocket');
const bodyparser = require('koa-bodyparser');

const router = require('./router');
const session = require('./session');
const websocket = require('./websocket');

const app = websockify(new Koa());

app.use(static(path.join(__dirname, './static')));

app.use(session(app));

app.use(bodyparser());

app.ws.use(websocket.middle());

app.use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log(`server at http://localhost:3000/`);
});