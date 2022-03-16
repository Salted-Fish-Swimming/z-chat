import { check } from './util.js';

class Render {

  constructor (dom) {
    this.dom = dom;
    this.classOptions = {};
  }

  class (value) {
    // 格式化输入数据
    if (check.isString(value)) {
      // 提前渲染退出
      this.dom.setAttribute('class', value);
      this.classOptions = { [value]: true};
      return this;
    } else if (value instanceof Array) {
      value = Object.fromEntries(value.map(k => [k, true]));
    } else if (typeof value === 'object') {
      // 默认格式
    }
    // 先比较哪些 class 被删除
    for (const clsName in this.classOptions) {
      if (this.classOptions[clsName]) {
        if (!value[clsName]) {
          this.classOptions[clsName] = false;
          this.dom.classList.remove(clsName);
        }
      }
    }
    // 再比较哪些 class 被加载
    for (const clsName in value) {
      if (value[clsName]) {
        if (!this.classOptions[clsName]) {
          this.classOptions[clsName] = true;
          this.dom.classList.add(clsName);
        }
      }
    }
  }

  style (styleObject) {
    for (const styleName in styleObject) {
      this.dom.style[styleName] = styleObject[styleName];
    }
  }

  on (events) {
    for (const key in events) {
      const type = `on${key}`;
      this.dom[type] = events[key];
    }
  }

  attr (key, value) {
    this.dom.setAttribute(key, value);
  }

  prop (props) {
    for (const key in props) {
      this.dom[key] = props[key];
    }
  }

}

class ClassRender {

  constructor (dom, options) {
    this.dom = dom;
    this.options = options;
  }

}

export { Render };