const uuid = require('uuid/v4');

module.exports = {
  middle () {
    return async (ctx, next) => {
      const { websocket } = ctx;
      const initData = {
        type: 'connect',
        wsid: uuid(),
      };
      websocket.send(JSON.stringify(initData));
      websocketManager.set(initData.wsid, new WebSocket(websocket));

      // 绑定销毁事件
      websocket.on('close', () => {
        websocketManager.remove(websocket);
      });
      await next();
    };
  },
  routes () {
    return async (ctx, next) => {
      const { session, request: { body } } = ctx;
      session.wsid = body.wsid;
      ctx.body = {
        type: 'success',
        message: 'connect success',
      };
      await next();
    }
  },
  get (session) {
    return websocketManager.get(session.wsid);
  },
  getById (wsid) {
    return websocketManager.get(wsid);
  }
}

const websocketManager = {
  cache: new Map(),
  set (id, websocket) {
    this.cache.set(id, websocket);
  },
  get (wsid) {
    return this.cache.get(wsid);
  },
  remove (id) {
    this.cache.delete(id);
  },
};

// websocket 的包装类
class WebSocket {

  constructor (websocket) {
    this.websocket = websocket;
  }

  send (info) {
    if (typeof info === 'string') {
      this.websocket.send(info);
    } else {
      this.websocket.send(JSON.stringify(info));
    }
  }
  
  on (...args) {
    this.websocket.on(...args);
  }
}