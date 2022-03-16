class Middler {

  constructor () {
    this.middle = [];
  }

  use (...mid) {
    this.middle.push(...mid);
    return this;
  }

  unUse (mid) {
    const index = this.middle.indexOf(mid);
    if (index >= 0) {
      this.middle.splice(index, 1);
    }
    return this;
  }

  compose (info) {
    if (this.middle.length == 0) return (next) => next(info);
    const r = (f) => this.unUse(f);
    const m = (info, remove) => ({ info, remove });
    return (next) => (this.middle.reduce(
      (f1, f2) => (info, next) =>
        f1(m(info, r(f1)), () => f2(m(info, r(f2)), next))
    ))(info, () => next(info));
  }

  static divide (fn) {
    const blockings = Array(fn.length).fill(0).map((v, i) => Symbol(i));
    const handler = fn(...blockings);
    return [
      ...blockings.map(v => () => handler.next()),
      () => handler.next(),
    ];
  }
}

class Event {

  constructor () {
    this.events = new Map();
    this.middler = new Middler;
  }

  on (type, callback) {
    if (!this.events.has(type))
      this.events.set(type, []);
    this.events.get(type).push(callback);
    return this;
  }

  emit (type, value, opts) {
    const middle = this.middler.compose({type, opts})
    if (!this.events.has(type)) {
      middle(() => {});
    } else {
      middle(() => {
        for (const callback of this.events.get(type)) {
          callback(value, opts);
        }
      });
    }
    return this;
  }

  off (type, fn) {
    const callbaks = this.events.get(type);
    const index = callbaks.indexOf(fn);
    if (index >= 0)
      callbaks.splice(index, 1);
    return this;
  }

  use (middle) {
    this.middler.use(middle);
    return this;
  }

  unUse (middle) {
    this.middler.unUse(middle);
    return this;
  }

}

const check = {
  isBoolean (value) {
    return typeof value === 'boolean';
  },
  isNumber (value) {
    return typeof value === 'number';
  },
  isString (value) {
    return typeof value === 'string';
  },
  isValueType (value) {
    return this.isBoolean(value) || this.isNumber(value)
      || this.isString(value);
  },
  isFunction (value) {
    return typeof value === 'function';
  },
  regulate (temp, src) {
    for (const key in temp) {
      const tValue = temp[key], sValue = src[key];
      if (this.isValueType(tValue)) {
        if (this.isValueType(sValue)) {
          temp[key] = sValue;
        }
      } else if (this.isFunction(tValue)) {
        if (this.isFunction(tValue)) {
          temp[key] = sValue;
        }
      } else if (typeof tValue === 'object') {
        if (typeof sValue === 'object') {
          this.regulate(tValue, sValue);
        }
      }
    }
    return temp;
  }
}

function delay (timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(0);
    }, timeout);
  })
}

function nextTick (count = 1) {
  if (count > 0) {
    return Promise.resolve(
      new Promise(
        res => requestAnimationFrame(
          () => res(nextTick(count - 1))
        )
      )
    );
  } else {
    return 0;
  }
}

export { Middler, Event, check, delay, nextTick };