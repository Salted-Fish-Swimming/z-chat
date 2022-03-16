import { dec } from "../../js/declaration.js";

const div = dec('div');
const span = dec('span');

export function PopMessage (message, type = 'default') {
  const style = {
    error: {
      color: '#f33',
    },
    default: {}
  }[type];

  return div ({
    class: 'layer-message-container',
  }) (
    span ({
      class: 'layer-message',
      style,
    }) (message),
  );
}