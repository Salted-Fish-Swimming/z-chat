import { dec } from '../../js/declaration.js';

const div = dec('div');

export class Layer {

  constructor () {
    this.container = div ({
      class: [ 'layer-container', 'hidden' ],
      on: {
        click: (event) => {
          event.stopPropagation();
          event.preventDefault();
        }
      }
    }) ();
    this.component = div ({
      class: [ 'layer-background', 'hidden' ],
      style: { zIndex: -20 },
      on: {
        click: (event) => {
          event.stopPropagation();
          event.preventDefault();
          this.close();
        }
      }
    }) ( this.container );
    this.window = null;
    this.state = 'close';
  }

  async pop (window) {
    if (this.window) {
      if (window) {
        this.container.replaceChild(window, this.window);
        this.window = window;
      }
    } else {
      if (window) {
        this.container.append(window)
        this.window = window;
      };
    }
    await this.open();
  }

  async open () {
    if (this.state === 'open') return;
    this.state = 'open';

    this.component.style.zIndex = 20;
    this.component.classList.remove('hidden');
    this.container.classList.remove('hidden');
    await new Promise(res => setTimeout(res, 400, 0));
  }

  async close () {
    if (this.state === 'close') return;
    this.state = 'close';

    this.container.classList.add('hidden');
    this.component.classList.add('hidden');
    await new Promise(res => setTimeout(res, 400, 0));
    this.component.style.zIndex = -20;
  }

  render () {
    return (dom) => {
      dom.append(this.component);
    }
  }
}