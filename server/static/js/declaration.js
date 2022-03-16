import { use, Type } from './use.js';
import { Render } from './render.js';
import { check } from './util.js';

function dec (type) {
  return (attrs) => decDom (type, attrs);
}

function render (render, value, opts) {
  if (check.isFunction(value) || value instanceof Type.Meta) {
    value(render);
  } else {
    render(value);
  }
}

function decDom (type, attrs) {
  const dom = document.createElement(type);
  const domRender = new Render(dom);

  attrs && Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'class') {
      // domRender.class(value);
      render(v => domRender.class(v), value, { dom });
    } else if (key === 'style') {
      // domRender.style(value);
      render(v => domRender.style(v), value, { dom });
    } else if (key === 'on') {
      render(v => domRender.on(v), value, { dom });
    } else if (key === 'prop') {
      render(v => domRender.prop(v), value, { dom });
    } else {
      render(v => domRender.attr(key, v), value, { dom });
    }
  });
  
  return (...children) => decChildren(dom, children);
}

function decChildren(dom, children) {
  children && children.forEach(child => {
    if (check.isString(child)) {
      dom.append(child);
    } else if (child instanceof HTMLElement || child instanceof Text) {
      dom.append(child);
    } else if (check.isFunction(child)) {
      child(dom);
    } else {
      return;
    }
  });
  return dom;
}

export { dec, use, check };