const Router = require('koa-router');

const wsManager = require('../../websocket');
const controller = require('../../controller');
const { User, Group, Message } = require('../../data-base');

const router = new Router();

router.post('/hello', async (ctx, next) => {
  ctx.body = {
    type: 'test',
    message: 'hello koa-router post://hello',
  };
});

router.post('/echo', async (ctx, next) => {
  const { session, request: { body } } = ctx;
  console.log(body);
  ctx.body = body;
})

router.post('/websocket', wsManager.routes());

// complete
router.post('/user', async (ctx, next) => {
  const { session, request: { body } } = ctx;
  if (body.type === 'regist') {
    // 注册
    const { email, username, password } = body.data;
    const result = await controller.regist(email, username, password);
    if (result.type === 'error') {
      ctx.body = result;
    } else {
      ctx.body = {
        type: 'success',
      };
    }
  } else if (body.type === 'login') {
    // 登录
    const { email, password } = body.data;
    const result = await controller.login(email, password, session.wsid);
    if (result.type === 'success') {
      session.uid = result.uid;
      const ws = wsManager.get(session);
      console.log('login-on');
      ws ?? ws.on('close', () => {
        controller.offline(session.uid);
        session.uid = null;
        console.log('login-off');
      });
      ctx.body = {
        type: 'success',
        data: await User.findOne({ uid: session.uid }, {
          _id: false, password: false, _v: false,
        }),
      };
    } else {
      ctx.body = result;
    }
  } else if (body.type === 'query') {
    // 查询
    const users = await User.find(body.query, {
      _id: false, password: false, friend: false,
      group: false, _v: false
    });
    if (session.uid) {
      ctx.body = {
        type: 'success',
        data: users.map(doc => doc.toObject()),
      };
    } else {
      ctx.body = {
        type: 'success',
        data: users.map(doc => ({})),
      }
    }
  } else {
    ctx.body = {
      type: 'error',
      message: '404 not-found',
    }
  }
  await next();
});

const auth = async (ctx, next) => {
  // 鉴权, 判断用户是否登录
  const { session } = ctx;
  if (session.uid) {
    await next();
  } else {
    ctx.body = {
      type: 'error',
      message: '请先登录',
    };
  }
}

router.post(
  '/friend', auth,
  async (ctx, next) => {
    const { session, request: { body } } = ctx;
    if (body.type === 'add') {
      const { fuid } = body.data;
      const result = await controller.addFriends(session.uid, fuid)
      if (result.type === 'error') {
        ctx.body = result;
      } else {
        ctx.body = {
          type: 'success',
          message: '好友添加成功',
        };
      }
    } else if (body.type === 'del') {
      const { fuid } = body.data;
      const result = await controller.delFriend(session.uid, fuid)
      if (result.type === 'error') {
        ctx.body = result;
      } else {
        ctx.body = {
          type: 'success',
          message: '好友删除成功',
        };
      }
    } else if (body.type === 'query') {
      const { option } = body;
      const user = await User.findOne({ uid: session.uid });
      if (user.friend.length === 0) {
        ctx.body = {
          type: 'success',
          data: [],
        };
      } else if (option.type === 'user') {
        const queryFriends = await User.find({
          $or: user.friend.map(uid => ({ uid }))
        }, {
          _id: false, password: false, friend: false,
          group: false, _v: false
        });
        ctx.body = {
          type: 'success',
          data: queryFriends.map(doc => doc.toObject()),
        }
      } else if (option.type === 'group') {
        const queryGroups = await Group.find({
          $or: user.group.map(gid => ({ gid })),
          type: 'double',
        }, {
          _id: false, _v: false
        });
        ctx.body = {
          type: 'success',
          data: queryGroups.map(doc => doc.toObject()),
        };
      } else {
        ctx.body = {
          type: 'error',
          message: '请求缺少 option 选项',
        };
      }
    } else {
      ctx.body = {
        type: 'error',
        message: '404 not-found',
      };
    }
    await next();
  }
)

router.post(
  '/message', auth,
  async (ctx, next) => {
    const { session, request: { body } } = ctx;
    if (body.type === 'send') {
      const { gid, message, type } = body.data;
      controller.send(session.uid, gid, message, type);
      ctx.body = {
        type: 'success',
        message: '发送成功',
      };
    } else if (body.type === 'query') {
      const { query, sort, limit } = body;
      console.log({ '/message:': body });
      if (query.gid) {
        const user = await User.findOne({ uid: session.uid });
        if (user.group.some(_gid => _gid === query.gid)) {
          const messages = await Message.find(query, {
            _id: false, _v: false,
          }).sort(sort).limit(limit);
          ctx.body = {
            type: 'success',
            data: messages.map(doc => doc.toObject()),
          }
        } else {
          ctx.body = {
            type: 'error',
            message: '您没有权限访问相关记录',
          }
        }
      } else {
        ctx.body = {
          type: 'error',
          message: '缺少 gid 参数',
        }
      }
    }
    await next();
  }
);

router.post(
  '/group', auth,
  async (ctx, next) => {
    const { session: { uid }, request: { body } } = ctx;
    if (body.type === 'join') {
      if (body.data.gid) {
        const result = await controller.join(uid, body.data.gid);
        if (result.type === 'error') {
          ctx.body = result;
        } else {
          ctx.body = { type: 'success' };
        }
      }
    } else if (body.type === 'create') {
      ;
    } else if (body.type === 'query') {
      const groups = await Group.find(body.query, {
        _id: false, _v: false,
      });
      ctx.body = {
        type: 'success',
        data: groups.map(doc => doc.toObject()),
      }
    }
  }
);

module.exports = router;
