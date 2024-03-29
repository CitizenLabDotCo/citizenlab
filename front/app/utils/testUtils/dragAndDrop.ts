import { fireEvent } from './rtl';

export default function dragAndDrop(
  dropZone: HTMLElement,
  dragElement: HTMLElement
) {
  // https://github.com/testing-library/vue-testing-library/issues/145
  fireEvent.mouseDown(dragElement, { which: 1, button: 0 });
  fireEvent.dragStart(dragElement);
  fireEvent.dragOver(dropZone);
  fireEvent.drop(dropZone);
  fireEvent.mouseUp(dropZone, { which: 1, button: 0 });
}
