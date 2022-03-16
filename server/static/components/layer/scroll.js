import { dec } from "../../js/declaration.js";

const div = dec('div');

export function ScrollLayer (inner) {
  return div ({
    class: 'scroll-layer-container'
  }) (
    inner,
    div ({
      class: 'scroll-bar-container'
    }) (
      div ({
        class: 'scroll-bar',
      }) (),
    ),
  );
}