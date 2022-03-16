import { nextTick } from "./util.js";

export class Router {

  constructor () {
    this.routes = {};
    this.dom = null;
    this.current = null;
  }

  render () {
    return (dom) => {
      this.dom = dom;
      const show = this.routes[this.current];
      if (show) {
        dom.append(show.component);
        this.lock = true;
        nextTick(2).then(v => {
          return show.start();
        }).then(v => this.lock = false);
      }
    }
  }

  to (url) {
    if (!this.routes[url]) return;
    if (this.lock) return;
    this.lock = true;
    const {
      component: currentComponent, end
    } = this.routes[this.current];
    this.current = url;
    const {
      component, start
    } = this.routes[url];

    nextTick(2).then(v => {
      return end();
    }).then(v => {
      this.dom.replaceChild(component, currentComponent);
      return nextTick(2);
    }).then(v => {
      return start();
    }).then(v => {
      this.lock = false;
    });
  }

  init (url, { component, start, end }) {
    this.routes[url] = {
      component, start, end
    }
    if (this.current === null) {
      this.current = url;
    }
  }
}