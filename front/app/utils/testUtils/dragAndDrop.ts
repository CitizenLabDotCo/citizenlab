import { fireEvent } from './rtl';

export function dragAndDrop(dropZone: HTMLElement, dragElement: HTMLElement) {
  fireEvent.mouseDown(dragElement, { which: 1, button: 0 });
  fireEvent.dragStart(dragElement);
  fireEvent.dragOver(dropZone);
  fireEvent.drop(dropZone);
  fireEvent.mouseUp(dropZone, { which: 1, button: 0 });
}
