const { User, Group, Message } = require('../data-base');
const wsm = require('../websocket');  // websocket-manager

// 用户登录状态
// user: { wsid: wsid, fs: [ uid ], gs: [ gid ] }
const state = {
  user: new Map(),
}

function generateId(count, length = 6) {
  let id = String(count + 1);
  while (id.length < length) {
    id = `0${id}`;
  }
  return id;
}

function filterNoProps (props) {
  return (object) => {
    return Object.fromEntries(
      Object.entries(object).filter(entry => !(entry[0] in props))
    );
  }
}

module.exports = {

  async regist (email, username, password) {
    if ((await User.findOne({ 'email': email }))) {
      return {
        type: 'error',
        message: '用户已存在',
      };
    } else {
      const uid = generateId(await User.count());
      const newuser = new User({
        uid, email, username, password
      });
      await newuser.save();
      return {
        type: 'success',
        uid
      };
    }
  },

  async login (email, password, wsid) {
    const user = await User.findOne({ email });
    if (!user) {
      return {
        type: 'error',
        message: '用户不存在',
      };
    }
    if (user.password != password) {
      return {
        type: 'error',
        message: '密码错误',
      };
    }
    state.user.set(user.uid, {
      wsid, friend: user.friend, group: user.group,
    });
    return {
      type: 'success',
      uid: user.uid,
    }
  },

  async offline (uid) {
    if (!state.user.has(uid)) {
      return {
        type: 'error',
        message: '用户已经下线',
      }
    }
    state.user.delete(uid);
    const user = await User.findOne({ uid });
    user.lastOffTime = Date.now();
    await user.save();
    return {
      type: 'success',
    }
  },

  async send (uid, gid, content, type) {
    const group = await Group.findOne({ gid });
    const message = new Message({
      mid: generateId(await Message.count(), 9),
      type, content, uid, gid,
    });
    const allUid = group.member;
    const sendedUser = allUid
      .map(id => id === uid ? null : state.user.get(id))
      .filter(user => !!user);
    // 广播
    sendedUser.forEach(user => {
      const ws = wsm.getById(user.wsid);
      ws.send({
        type: 'send',
        data: { uid, gid, content, type },
      });
    });
    // 保存历史记录
    await message.save();
  },

  async join (uid, gid) {
    const group = await Group.findOne({ gid });
    if (!(group instanceof Group)) {
      return {
        type: 'error',
        message: '对应群号的群不存在',
      };
    }
    group.member.push(uid);
    await group.save();
    return { type: 'success' };
  },

  async addFriends (uid, fuid) {
    const user = await User.findOne({ uid });
    if (user.friend.some(_fuid => _fuid === fuid)) {
      return {
        type: 'error',
        message: '他已经是你的好友了',
      };
    }
    const friend = await User.findOne({ uid: fuid });
    user.friend.push(fuid);
    friend.friend.push(uid);
    const gid = generateId(await Group.count());
    const group = new Group({
      gid, name: '聊天', type: 'double', 
      member: [ uid, fuid ],
    });
    user.group.push(gid);
    friend.group.push(gid);
    await user.save();
    await friend.save();
    await group.save();
    const fws = wsm.getById(state.user.get(friend.uid));
    fws.send({
      type: 'add',
      option: { type: 'friend' },
      data: {
        uid: friend.uid
      },
    });
    return { type: 'success' };
  },

  async delFriend (uid, fuid) {
    const user = await User.findOne({ uid });
    if (!user.friend.some(id === fuid)) {
      return {
        type: 'error',
        message: '你没有这个朋友',
      };
    }
    user.friend.splice(user.friend.indexOf(fuid), 1);
    await user.save();
    return { type: 'success' };
  },

  async newGroup (uid) {
    const gid = generateId(await Group.count());
    const group = new Group({
      gid, name: '群聊', type: 'group', master: uid,
      member: [ uid ],
    });
    await group.save();
    return {
      type: 'success', gid
    };
  }
};
