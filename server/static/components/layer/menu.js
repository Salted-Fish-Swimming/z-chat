import { dec } from "../../js/declaration.js";

const div = dec('div');
const button = dec('button');

export function PopMenu (menus) {
  return (
    div ({ class: 'layer-menu-container'}) (
      ...menus.map(([ content, event ]) => {
        return (
          button ({
            class: 'layer-menu-item',
            on: { click: event },
          }) (content)
        );
      }),
    )
  );
}