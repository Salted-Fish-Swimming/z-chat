import { dec, use, check } from '../js/declaration.js';

const input = dec('input');
const div = dec('div');

function Input (opts) {
  opts = check.regulate({
    width: '300px',
    height: '48px',
    type: 'text',
    placeholder: 'default',
    on: {
      change: () => {}
    }
  }, opts);

  const { data, meta, all } = use({
    value: '',
    class: {
      'input-container': true,
      'focus': false,
      'error': false,
    }
  });

  meta.value(opts.on.change);

  const placeholderText = new Text(opts.placeholder);

  const inputComponent = input ({
    class: 'input-input', type: opts.type,
    on: {
      input: (event) => data.value = event.target.value,
      blur: (event) => {
        if (data.value.length === 0 && !data.class.error)
          data.class.focus = false;
      },
      focus: (event) => {
        data.class.focus = true;
      }
    }
  }) ();
  
  const component = div ({
    class: meta.class,
    style: {
      width: opts.width, height: opts.height
    }
  }) (
    inputComponent,
    div ({
      class: 'input-placeholder'
    }) (placeholderText),
  )

  const placeholder = function (value) {
    placeholderText.data = value;
  };

  const error = function () {
    data.class.focus = true;
    data.class.error = true;
  };

  const normal = function () {
    // if (data.value.length === 0)
    //   data.class.focus = false;
    data.class.error = false;
  };

  const focus = function () {
    data.class.focus = true;
    inputComponent.focus();
  }

  return { component, placeholder, error, normal, focus }
}

export { Input };