import { dec, use } from '../js/declaration.js';
import { delay } from '../js/util.js';

import { MessageList } from '../components/Message.js';

import { client } from '../controller/chat.js';
import { GroupList } from '../components/GroupList.js';
import { PopGroup } from '../components/layer/group.js';
import { PopMenu } from '../components/layer/menu.js';
import { PopMessage } from '../components/layer/message.js';
import { post } from '../js/web/util.js';

const div = dec('div');
const span = dec('span');
const ul = dec('ul');
const li = dec('li');
const button = dec('button');

async function initMesssage (group) {
  const { name, gid } = group;
  const _message = await post('/message', {
    type: 'query', query: { gid },
    sort: { update: -1 }, limit: 1,
  });
  const content =
    _message.data.length === 0
    ? ''
    : {
        text: _message.data[0].content,
        image: '[ 图片 ]'
      }[_message.data[0].type];
  return { gid, name, content };
}

async function initData (context) {
  const { data } = context;
  const { uid } = data.userinfo;
  const friendResp = await post('/friend', {
    type: 'query', option: { type: 'user' }
  });
  if (friendResp.type === 'error') {
    console.log(friendResp);
    return 0;
  }
  data.userinfo.friend = friendResp.data
  const groupResp = await post('/group', {
    type: 'query', query: {
      member: uid, type: 'group',
    }
  });
  if (groupResp.type === 'error') {
    console.log(groupResp);
    return 0;
  }
  data.userinfo.group = groupResp.data;
  for (const friend of friendResp.data) {
    const _group = await post('/group', {
      type: 'query',
      query: {
        type: 'double', member: { $all: [ uid, friend.uid ] }
      }
    });
    if (_group.type === 'error') {
      console.log(_group);
    } else if (_group.data.length === 0) {
      console.log('');
    } else {
      const result = await initMesssage(_group.data[0]);
      context.addGroup({ ...(result), name: friend.username });
    }
  }
  for (const _group of groupResp.data) {
    context.addGroup(await initMesssage(_group));
  }
}

function ChatPage (context) {
  const { data, meta } = use({
    container: {
      'chat-container': true, 'hidden': true,
    },
  });

  let message = '';

  const mixIn = (mix) => ({ ...context, ...mix });

  const Message = new MessageList(context);
  const Group = new GroupList(mixIn({
    addEvent (event) {
      context.layer.pop(PopMenu([
        [ '加好友 / 加群' , async () => {
          await context.layer.close();
          await context.layer.pop(PopGroup(mixIn({
            addFriendEmit (friend) {
              context.data.userinfo.friend.push(friend);
              Group.push({
                name: friend.username, content: '',
                async click () {
                  const group = (await post('/group', {
                    type: 'query', query: {
                      type: 'double', member: { $all: [ context.data.userinfo.uid, friend.uid ]}
                    }
                  })).data[0];
                  context.data.chat.gid = group.gid;
                  Message.refresh(group.gid);
                }
              });
            },
            addGroupEmit (group) {
              context.data.userinfo.group.push(group);
            }
          })));
        } ],
        [ '创建群聊' , async () => {
          await context.layer.close();
          await context.layer.pop(PopMessage('还没做好'));
          await delay(1500);
          await context.layer.close();
        } ],
      ]));
    }
  }));

  const messageInput = (
    dec ('textarea') ({
      class: 'chat-message-input-textarea',
      on: { input: (e) => message = e.target.value }
    }) ()
  );

  const send = async (event) => {
    if (message.length > 0) {
      await client.send(context.data.chat.gid, message, 'text');
      await Message.push(context.data.userinfo.uid, message, 'text');
      pullDown()
      messageInput.value = '';
    }
  }

  client.onMessage(
    ({ uid, gid, content, type }) => {
      if (context.data.chat.gid === gid) {
        Message.push(uid, content, type);
        pullDown();
      }
    }
  )

  const messageContainer = (
    div ({ class: 'chat-message-container' }) (
      Message.render(),
    )
  );

  const pullDown = () => {
    messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.offsetHeight
  }

  const component = (
    div ({
      class: meta.container,
    }) (
      div ({
        class: 'chat-sidebar-container'
      }) (
        Group.render(),
      ),
      div ({
        class: 'chat-content-container',
      }) (
        messageContainer,
        div ({ class: 'chat-message-input-container' }) (
          ul ({ class: 'chat-message-input-menue' }) (
            li ({ class: 'menue-option-container' }) (
              span ({ class: 'menue-option' }) (
                '文字',
              ),
            ),
            li ({ class: 'menue-option-container' }) (
              span ({ class: 'menue-option' }) (
                '图片',
              ),
            ),
          ),
          messageInput,
          div ({ class: ['chat-message-button-container', 'middle-container' ]}) (
            button ({
              class: 'chat-message-button',
              on: { click: send },
            }) ('发送'),
          ),
        ),
      ),
    )
  );

  return {
    component,
    start: async () => {
      context.data.chat = {}
      data.container.hidden = false;
      const initP = initData(mixIn({
        addGroup ({ gid, name, content }) {
          Group.push({
            name, content,
            click (event) {
              console.log({ gid, name, content });
              context.data.chat.gid = gid;
              Message.refresh(gid);
            }
          });
        },
      }));
      await delay(500);
      await initP;
    },
    end: async () => {
      data.container.hidden = true;
      await delay(500);
    }
  };
}

export { ChatPage };