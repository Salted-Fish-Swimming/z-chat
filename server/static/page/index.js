import { dec } from '../js/declaration.js';
import { Router } from '../js/router.js';

import { LoginPage } from './loginPage.js';
import { ChatPage } from './chatPage.js';

import { Layer } from '../components/layer/layer.js';

const div = dec('div');

const router = new Router();
const layer = new Layer();
const context = {
  router,
  layer,
  data: {},
};

const login = LoginPage(context);
const chat = ChatPage(context);

router.init('login', login);
router.init('chat', chat);

function Page (opts) {

  const component = div ({
    class: 'middle-container',
  }) (
    router.render(),
    layer.render(),
  );

  return component;
}

export { Page };
  