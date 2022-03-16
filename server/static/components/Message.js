import { dec } from "../js/declaration.js";
import { post } from "../js/web/util.js";

const div = dec('div');
const span = dec('span');
const ul = dec('ul');
const li = dec('li');
const img = dec('img');

function MessageContent (content, type, self) {
  return div ({
    class: self ? 'message-content self' : 'message-content',
  }) (
    content,
  );
}

function Message (content, type, avatar, layer, self) {
  return li ({
    class: 'message-container',
  }) (
    div ({
      class: 'message-container-left',
    }) (
      div ({
        class: self ? 'avatar-image-container self' : 'avatar-image-container',
        on: { click: (e) => { layer.open(); }}
      }) ( img ({ class: 'avatar-image' }) () ),
    ),
    div ({ class: 'message-container-right'}) (
      div ({ class: 'avatar-name-container'}) (avatar.name),
      div ({
        class: 'message-content-container',
      }) (
        MessageContent(content, type, self),
      ),
    ),
  );
}

class MessageList {

  constructor (context) {
    this.context = context;
    this.message = [];
    this.dom = ul({ class: 'message-history-container' }) ();
  }

  async refresh (gid) {
    console.log({ gid })
    const message = await post('/message', {
      type: 'query', query: { gid }, sort: { update: -1 }, limit: 10
    });
    this.dom.innerHTML = '';
    console.log(message);
    message.data.reverse().forEach(mesg => this.push(mesg.uid, mesg.content, mesg.type));
  }

  push (uid, content, type='text') {
    const { data: { userinfo } } = this.context;
    const avator = {
      name: userinfo.uid === uid
        ? userinfo.username
        : userinfo.friend.find(f => f.uid === uid)?.username ?? ''
    };
    console.log({avator, userinfo, uid});
    this.dom.append(Message(content, type, avator, this.context.layer, userinfo.uid === uid));
  }

  render () {
    return (dom) => {
      dom.append(this.dom);
    };
  }
}

export { MessageList };