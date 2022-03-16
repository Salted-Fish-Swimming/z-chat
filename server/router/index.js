const Router = require('koa-router');

const posts = require('./post');

const router = new Router();

router.get('/hello', async (ctx, next) => {
  ctx.body = 'Hello z-chat!';
  await next();
});

router.use(posts.routes(), posts.allowedMethods());

module.exports = router;