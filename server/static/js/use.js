import { Event, check, Middler } from './util.js';

function createType (proto) {
  const type = new Function();
  type.prototype = proto;
  proto.constructor = type;
  return type
}

const Type = (() => {
  const Meta = createType({ type: Symbol('Meta' )});
  const Data = createType({ type: Symbol('Meta' )});

  const MetaInstance = Object.create(Meta.prototype);
  const DataInstance = Object.create(Data.prototype);

  return {
    Meta, Data,
    MetaObject: createType(MetaInstance),
    MetaArray: createType(MetaInstance),
    DataObject: createType(DataInstance),
    DataArray: createType(MetaInstance),
  };
})();

function computed (...metas) {
  return function (compute) {
    const datas = [];
    const callbacks = [];
    let value = undefined;
    for (const index in metas) {
      metas[index]((thisValue) => {
        datas[index] = thisValue;
        value = compute(...datas);
        callbacks.forEach(fn => fn(value));
      });
    }
    return Object.setPrototypeOf(function (fn) {
      fn(value);
      callbacks.push(fn);
    }, Type.Meta.prototype);
  }
}

function mountLifing (parent, prop, child) {
  return function* (blocking) {
    const childMiddle = (ctx, next) => {
      next();
      parent.all.event.emit(prop, parent.all.visitor[prop]);
    }

    parent.all.visitor[prop] = child.data;
    parent.all.trigger[prop] = child.meta;

    child.all.event.use(childMiddle);
    child.all.metaProto = (callback) => {
      parent.meta[prop] = callback;
    }

    yield blocking;

    child.all.metaProto = () => {};
    child.all.event.unUse(childMiddle);
    
    parent.all.visitor[prop] = null;
    parent.all.trigger[prop] = null;
  }
}

function useObject (init) {
  const { data, meta, all } = newMetaObject();

  for (const key in init) {
    data[key] = init[key];
  };

  return { data, meta, all };
}

function newMetaObject () {
  const all = {
    visitor: {}, trigger: {}, keys: {},
    event: new Event(), metaProto: () => {},
    unMount: {},
  };

  const data = new Proxy(all.keys, {
    get (target, prop) {
      return all.visitor[prop];
    },
    set (target, prop, value) {
      if (all.visitor[prop] === value) return true;
      if (!target[prop]) target[prop] = true;
      if (all.unMount[prop]) all.unMount[prop]();

      if (check.isValueType(value)) {
        all.visitor[prop] = value;
        all.event.emit(prop, value);
        return true;
      }
      if (value instanceof Array) {
        return false;
      }
      if (value && typeof value === 'object') {
        value = useObject(value);
        const [ mount, unmount ] = Middler.divide(
          mountLifing({ meta, data, all }, prop, value)
        );
        mount();
        all.unMount[prop] = unmount;
        return true;
      }
    },
    ownKeys (target) {
      return Object.keys(target);
    },
    getPrototypeOf (target) {
      return Type.DataObject;
    }
  });

  const meta = new Proxy(new Function(), {
    get (target, prop) {
      if (!all.trigger[prop]) {
        all.trigger[prop] = (callback) => {
          meta[prop] = callback;
        };
      }
      return all.trigger[prop];
    },
    set (target, prop, callback) {
      callback(all.visitor[prop]);
      all.event.on(prop, callback);
      return true;
    },
    getPrototypeOf (target) {
      return Type.MetaObject;
    },
    apply (target, ctx, args) {
      all.metaProto(...args);
    }
  });

  return { data, meta, all};
}

function use (init) {
  return useObject(init);
}

export { Type, use, computed };