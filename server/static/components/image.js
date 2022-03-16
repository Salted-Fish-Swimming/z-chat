import { dec, check } from '../js/declaration.js';

const div = dec('div');

export function Image (opts) {
  opts = check.regulate({
    width: '100px', height: '100px',
    url: 'none', message: '这是图片',
  }, opts);

  const textSize = {
    height: '50px', width: '100px',
    lineHeight: '50px', fontSize: '40px',
  }

  return div ({
    class: ['middle-container'],
  }) (
    div ({
      style: {
        ...textSize,
      }
    }) (opts.message),
  );
}