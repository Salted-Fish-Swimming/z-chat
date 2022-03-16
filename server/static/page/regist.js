import { use, dec } from '../js/declaration.js';
import { delay } from '../js/util.js';
import { post } from '../js/web/util.js';

import { Input } from '../components/input.js';
import { LoginFormHeader } from '../components/loginFormHeader.js';

const div = dec('div');
const button = dec('button');

function throttle (fn, time = 100) {
  const state = {
    lock: false, args: [], count: 0,
  };
  return function (...args) {
    state.args = args;
    if (state.count < 2) {
      state.count ++;
      return;
    }
    if (state.lock)
      return;
    state.lock = true;
    setTimeout(() => {
      state.lock = false;
      fn(...state.args)
    }, time);
  }
}

async function isRepeatEmail (email) {
  const response = await post('/user', {
    type: 'query',
    query: { email },
  });
  return response.data.length > 0;
}

async function checkEmail (email, component) {
  const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (email.length === 0) {
    component.error();
    component.placeholder('邮箱不能为空');
    return false;
  } else if (!emailReg.test(email)) {
    component.error();
    component.placeholder('邮箱格式不合法');
    return false;
  } else if (await isRepeatEmail(email)) {
    component.error();
    component.placeholder('该邮箱已被注册');
    return false;
  } else {
    component.normal();
    component.placeholder('邮箱');
    return true;
  }
}

function checkUsername (username, component) {
  if (username.length === 0) {
    component.error();
    component.placeholder('用户名不能为空')
  } else {
    component.normal();
    component.placeholder('用户名')
  }
  return true;
}

function checkPassword (password, component) {
  if (password.length === 0) {
    component.error();
    component.placeholder('密码不能为空');
  } else {
    component.normal();
    component.placeholder('密码');
  }
  return true;
}

function Regist (context) {
  const { regist } = context;

  const { data, meta } = use({
    email: '', username: '', password: '',
  });

  const EmailInput = Input({
    placeholder: '邮箱', type: 'email',
    on: { change: v => data.email = v, },
  });

  const UsernameInput = Input({
    placeholder: '用户名', type: 'text',
    on: { change: v => data.username = v },
  });

  const PasswordInput = Input({
    placeholder: '密码', type: 'password',
    on: { change: v => data.password = v },
  });

  meta.email(throttle(
    v => checkEmail(data.email, EmailInput)
    , 0
  ));

  meta.username(throttle(
    v => checkUsername(data.username, UsernameInput)
    , 0
  ));

  meta.password(throttle(
    v => checkPassword(data.password, PasswordInput)
    , 0
  ));

  const commit = async function (event) {
    if (!(await checkEmail(data.email, EmailInput))) {
      EmailInput.focus();
    } else if (!checkUsername(data.username, UsernameInput)) {
      UsernameInput.focus();
    } else if (!checkPassword(data.password, PasswordInput)) {
      PasswordInput.focus();
    } else {
      // commit;
      await regist(data.email, data.username, data.password);
    }
  };

  const normalHeight = 70 * 3 + 10 + 80 + 50;

  const component =
    div ({
      class: 'login-form-container',
      style: {
        height: `${0}px`,
      }
    }) (
      LoginFormHeader({ ...context, type: 'regist' }),
      div ({
        class: 'login-form',
        style: {
          height: `${70 * 3 + 10}px`,
        }
      }) (
        EmailInput.component,
        UsernameInput.component,
        PasswordInput.component,
      ),
      div ({
        class: [ 'login-button-container', 'middle-container' ],
      }) (
        button ({
          class: 'login-button',
          on: { click: commit },
        }) ('注册'),
      ),
    );

  return {
    component,
    start: async () => {
      component.style.height = `${normalHeight}px`;
      await delay(500);
    },
    end: async () => {
      component.style.height = 0;
      await delay(500);
    },
  };
}

export { Regist };