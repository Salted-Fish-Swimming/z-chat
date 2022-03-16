import { dec } from "../../js/declaration.js";
import { delay } from "../../js/util.js";
import { post } from "../../js/web/util.js";
import { GroupItem } from "../GroupList.js";
import { PopMessage } from "./message.js";

const div = dec('div');
const img = dec('img');
const input = dec('input');
const button = dec('button');
const ul = dec('ul');
const li = dec('li');

async function query (url, query, option) {
  return await post(url, {
    type: 'query', query, option
  });
}

async function queryUser (info, option) {
  // 校验输入
  const isId = /^[0-9]+$/;
  const isEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (isId.test(info)) {
    return (await query('/user', { uid: { $regex: info }, ...option })).data;
  } else if (isEmail.test(info)) {
    return (await query('/user', { username: { $regex: info }, ...option })).data;
  } else {
    return [];
  }
}

async function queryGroup (info, option) {
  // 校验输入
  const isId = /^[0-9]+$/;
  const isEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (isId.test(info)) {
    return (await query('/group', { gid: { $regex: info }, ...option })).data;
  } else if (isEmail.test(info)) {
    return (await query('/group', { name: { $regex: info }, ...option })).data;
  } else {
    return [];
  }
}

export function PopGroup (context) {
  const { addFriendEmit, addGroupEmit } = context;

  const GroupList = ul ({ class: 'group-list' }) ();
  const UserList = ul ({ class: 'user-list' }) ();

  const state = {
    input: { value: '', },
    query: {
      user: { running: false, },
      group: { running: false, }
    }
  };

  const mixIn = (mix) => ({ ...context, ...mix });

  const popMsg = async (info, type) => {
    await context.layer.close();
    await context.layer.pop(PopMessage(info, type));
    await delay(1500);
    await context.layer.close();
    await context.layer.pop(PopGroup(mixIn({ input: state.input })));
  }

  const search = async () => {
    if (state.query.group.running) {
      return 0;
    } else {
      state.query.group.running = true;
      const groups = (await queryGroup(
        state.input.value, {
          type: 'group',
          member: { $nin: [ context.data.userinfo.uid ] },
        }));
      GroupList.innerHTML = '';
      GroupList.append(
        ...groups.map(g => GroupItem({
          name: g.name, content: '',
          button: {
            content: '加群',
            async click (event) {
              const respData = await post('/group', {
                type: 'join', data: { gid }
              });
              if (respData.type === 'error') {
                await popMsg(respData.message, 'error');
              } else {
                await popMsg('成功进入群聊');
                await addGroupEmit(g);
              }
            },
          }
        })),
      );
      state.query.group.running = false;
    }
    if (state.query.user.running) {
      return 0;
    } else {
      state.query.user.running = true;
      const users = (await queryUser(state.input.value, {
        uid: { $ne: context.data.userinfo.uid },
        friend: { $nin: [ context.data.userinfo.uid ] }
      }));
      UserList.innerHTML = '';
      UserList.append(
        ...users.map(u => GroupItem({
          name: u.username, content: '',
          button: {
            content: '加好友',
            async click (event) {
              const respData = await post('/friend', {
                type: 'add', data: { fuid: u.uid }
              }, { type: 'user' });
              if (respData.type === 'error') {
                await popMsg(respData.message, 'error');
              } else {
                await popMsg('好友添加成功');
                await addFriendEmit(u);
              }
            },
          }
        })),
      );
      state.query.user.running = false;
    } 
  }

  if (context?.input?.value) {
    state.input.value = context.input.value;
    if (context.input.value.length > 0) {
      search();
    }
  }

  const component = (
    div ({ class: 'layer-group-container' }) (
      div ({ class: 'layer-group-search-container' }) (
        div ({ class: 'search-container' }) (
          input ({
            class: 'input',
            placeholder: '邮箱 / 用户id / 群id',
            prop: { value: state.input.value },
            on: {
              input (event) {
                state.input.value = event.target.value;
                search();
              }
            }
          }) (),
          button ({
            class: 'button', on: { click: (event) => search() }
          }) ('搜索'),
        ),
      ),
      div ({ class: 'layer-group-display-container' }) (
        div ({ class: 'display-user-container' }) (
          GroupList,
        ),
        div ({ class: 'hr-container' }) (
          div ({ class: 'hr' }) ()
        ),
        div ({ class: 'display-group-container' }) (
          UserList,
        ),
      )
    )
  );

  return component;
}