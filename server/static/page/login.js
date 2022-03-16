import { use, dec } from '../js/declaration.js';
import { delay } from '../js/util.js';

import { Input } from '../components/input.js';
import { LoginFormHeader } from '../components/loginFormHeader.js';
import { PopMessage } from '../components/layer/message.js';

const div = dec('div');
const button = dec('button');
const header = dec('header');

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

function checkEmail (email, component) {
  const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (email.length === 0) {
    component.error();
    component.placeholder('邮箱不能为空');
    return false;
  } else if (!emailReg.test(email)) {
    component.error();
    component.placeholder('邮箱格式不合法');
    return false;
  } else {
    component.normal();
    component.placeholder('邮箱');
    return true;
  }
}

function checkPassword (password, component) {
  if (password.length === 0) {
    component.error();
    component.placeholder('密码不能为空');
    return false;
  } else {
    component.normal();
    return true;
  }
}

function Login (context) {
  const { login } = context;

  const { data, meta } = use({
    email: '', password: '',
  });

  const EmailInput = Input({
    placeholder: '邮箱', type: 'email',
    on: { change: v => data.email = v, },
  });

  const PasswordInput = Input({
    placeholder: '密码', type: 'password',
    on: { change: v => data.password = v },
  });

  meta.email(throttle(
    v => checkEmail(
      data.email, EmailInput,
    ), 0
  ));

  meta.password(throttle(
    v => checkPassword(
      data.password, PasswordInput
    ), 0
  ));

  const commit = function (event) {
    if (!checkEmail(data.email, EmailInput)) {
      EmailInput.focus();
    } else if (!checkEmail(data.email, PasswordInput)) {
      PasswordInput.focus();
    } else {
      // commit;
      login(data.email, data.password);
    }
  };

  const normalHeight = 70 * 2 + 10 + 80 + 50;
  const component =
    div ({
      class: 'login-form-container',
      style: {
        height: `${0}px`,
      }
    }) (
      LoginFormHeader({ ...context, type: 'login' }),
      div ({
        class: 'login-form',
        style: {
          height: `${70 * 2 + 10}px`,
        }
      }) (
        EmailInput.component,
        PasswordInput.component,
      ),
      div ({
        class: [ 'login-button-container', 'middle-container' ],
      }) (
        button ({
          class: 'login-button',
          on: { click: commit },
        }) ('登录'),
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

export { Login };