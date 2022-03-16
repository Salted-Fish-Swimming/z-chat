import { dec } from "../js/declaration.js";

const ul = dec('ul');
const li = dec('li');
const div = dec('div');
const img = dec('img');
const button = dec('button');

export function GroupItem ({
  name = '', content = '',
  container, image,
  button: _button,
}) {
  return (
    li ({
      class: 'group-info-container',
      on: container ? { click: container.click } : {},
    }) (
      div ({
        class: 'group-avator-container',
      }) (
        div ({
          class: 'group-avator-image-container'
        }) (
          img ({
            class: [ 'group-avator-image', 'no-img' ],
          }) (),
        ),
      ),
      div ({
        class: 'group-text-container',
      }) (
        div ({
          class: 'group-name-container'
        }) ( name ),
        div ({
          class: 'group-content-container'
        }) ( content ),
      ),
      _button ? div ({
        class: 'button-container',
      }) (
        button ({
          class: 'button', on: { click: _button.click }
        }) (_button.content),
      ) : undefined,
    )
  )
}

function AddGroup ({ click }) {
  return li ({
    class: 'add-group-container',
    on: { click },
  }) (
    div ({
      class: 'add-group-icon'
    }) (
      div ({ class: 'icon-align' }) (),
      div ({ class: 'icon-vertical' }) (),
    ),
  );
}

export class GroupList {

  constructor (context) {
    this.endDom = AddGroup({
      click: context.addEvent,
    });
    this.dom = ul ({
      class: 'chat-group-list-container',
    }) (
      this.endDom,
    );
  }

  push ({name, content, imgsrc, click}) {
    this.dom.insertBefore(GroupItem({
      name, content, image: imgsrc, container: { click }
    }), this.endDom);
    return this;
  }

  clear () {
    this.dom.innerHTML = '',
    this.dom.append(this.endDom);
  }

  render () {
    return (dom) => {
      dom.append(this.dom);
    };
  }
}