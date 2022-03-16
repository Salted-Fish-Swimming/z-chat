import { dec } from "../js/declaration.js";

const header = dec('header');
const div = dec('div');
const span = dec('span');

export function LoginFormHeader (context) {
  const { router, type } = context;

  const { left, right } = {
    login: {
      left: [ 'left', 'selected' ],
      right: 'right',
    },
    regist: {
      left: 'left',
      right: [ 'right', 'selected' ],
    }
  }[type];

  const component =
    header ({
      class: [ 'login-form-header-container', 'middle-container' ],
    }) (
      div ({
        class: 'header-container',
        on: { click: (e) => {
          router.to({
            login: 'regist', regist: 'login',
          }[type]);
        } }
      }) (
        span ({
          class: left
        }) ('登录'),
        span ({
          class: right
        }) ('注册'),
      ),
    );
  
  return component;
}