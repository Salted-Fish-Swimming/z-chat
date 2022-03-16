import { use, dec } from '../js/declaration.js';
import { delay } from '../js/util.js';
import { post } from '../js/web/util.js';

import { Regist } from './regist.js';
import { Router } from '../js/router.js';
import { Login } from './login.js';
import { PopMessage } from '../components/layer/message.js';

function registPost (context) {
  return async function (email, username, password) {
    try {
      const responseData = await post('/user', {
        type: 'regist',
        data: {
          email, username, password,
        }
      });
      if (responseData.type === 'error') {
        context.layer.pop(PopMessage(responseData.message, 'error'));
        await delay(1000);
        context.layer.close();
      } else {
        await loginPost(context)(email, password);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function loginPost (context) {
  return async function (email, password) {
    try { 
      const responseData = await post('/user', {
        type: 'login',
        data: {
          email, password,
        }
      });
      if (responseData.type === 'error') {
        context.layer.pop(PopMessage(responseData.message, 'error'));
        await delay(1500);
        context.layer.close();
      } else {
        context.data.userinfo = {
          uid: responseData.data.uid, email,
          username: responseData.data.username,
          friend: [], group: []
        };
        console.log(responseData);
        context.router.to('chat');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

const div = dec('div');
const header = dec('header');

function LoginPage (context) {
  const router = new Router();

  const { meta, data } = use({
    class: { 'login-container': true, 'hidden': true },
  });

  const mixIn = (mix) => ({ ...context, ...mix });

  const regist = Regist(mixIn({ router, regist: registPost(context) }));

  const login = Login(mixIn({ router, login: loginPost(context) }));

  router.init('login', login);
  router.init('regist', regist);

  const component = div ({
    class: meta.class,
  }) (
    header ({
      class: [ 'login-header', 'middle-container' ],
    }) (
      dec ('h1') ({
        class: 'login-title',
      }) ('z-chat'),
    ),
    router.render(),
  );

  return {
    component,
    start: async () => {
      data.class.hidden = false;
      await delay(500);
    },
    end: async () => {
      console.log(context.data);
      data.class.hidden = true;
      await delay(500);
    },
  };
}

export { LoginPage };