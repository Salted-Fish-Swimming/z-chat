const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/zchat');

const UserSchema = mongoose.Schema({
  uid: {
    type: String,
    require: true,
    unique: true,
    match: [ /^[0-9]{5,}$/, 'uid 格式错误' ],
  },
  email: {
    type: String, require: true, unique: true,
  },
  username: {
    type: String, require: true,
  },
  password: {
    type: String, require: true,
  },
  update: {
    type: Date, default: Date.now
  },
  lastOffTime: {
    type: Date,
    default: Date.now,
  },
  friend: { type: [ String ], default: [], },
  group: { type: [ String ], default: [], },
});

const User = mongoose.model('user', UserSchema);

const GroupSchema = mongoose.Schema({
  gid: {
    type: String,
    require: true,
    unique: true,
    match: /^[0-9]{6,}$/,
  },
  name: String,
  type: {
    type: String,
    enum: [ 'double', 'group' ],
    default: 'double',
  },
  master: String, // uid
  member: [ String ], // [ uid ]
  update: {
    type: Date,
    default: Date.now
  },
});

const Group = mongoose.model('group', GroupSchema);

const MessageSchema = mongoose.Schema({
  mid: {
    type: String,
    require: true,
    unique: true,
  },
  type: {
    type: String,
    enum: [
      "text", "image",
    ],
    default: "text",
  },
  content: String,
  update: {
    type: Date,
    default: Date.now
  },
  uid: {
    type: String, require: true,
  }, // uid
  gid: {
    type: String, require: true,
  },  // gid
});

const Message = mongoose.model('message', MessageSchema);

module.exports = {
  User, Group, Message,
};

(async function test () {
  try {
    // const users1 = await User.find({}, { update: true});
    const message = await Message.find({ gid: '000001' });
    console.log('start');
    console.log({
      // users: users1,
      message
    });
    console.log('end');
    // const users2 = await User.find({}, { update: true }).sort(undefined).limit(undefined);
    // console.log({
    //   users: users2
    // })
    // user.lastOffTime = Date.now();
    // await user.save();
  } catch (error) {
    console.log(error);
  } finally {
    await mongoose.disconnect();
  }
});
