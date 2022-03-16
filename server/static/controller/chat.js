import { post } from '../js/web/util.js';

const websocket = new WebSocket(`ws://${window.location.host}/`);

websocket.onmessage = function (message) {
  const resp = JSON.parse(message.data);
  if (resp.type === 'connect') {
    post('/websocket', {
      type: 'connect',
      wsid: resp.wsid,
    });
  } else {
    console.log(resp);
    client.onMessage(resp.data);
  }
}

websocket.onerror = function (error) {
  console.log(error);
}

export const client = {
  async send (gid, message, type) {
    console.log({gid, message, type});
    await post('/message', {
      type: 'send',
      data: {
        gid, message, type
      }
    });
  },
  onMessage (message) {  },
}