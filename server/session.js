const session = require('koa-session');

const cache = new Map();

// 配置 koa-session 相关选项
module.exports = (app) => {
  // 设置加密密钥
  app.keys = ['alksasdkfjas'];

  return session({
    key: 'session',  maxAge: 86400000,   autoCommit: true,
    overwrite: true,  httpOnly: true,     signed: true,
    rolling: false,   renew: false,       secure: false,
    sameSite: null,
    // 设置外部 session 存储, koa-session 默认存储在 cookie 中
    // 此处更改为默认存储于 cache 中
    store: {
      get (key, maxAge, opts) {
        const { rolling, ctx } = opts;
        return cache.get(key);
      },
      set (key, sess, maxAge, opts) {
        const { rolling, changed, ctx } = opts;
        cache.set(key, sess);
        return true;
      },
      destroy (key, opts) {
        const { ctx } = opts;
        cache.delete(key);
        return true;
      }
    }
  }, app);
};