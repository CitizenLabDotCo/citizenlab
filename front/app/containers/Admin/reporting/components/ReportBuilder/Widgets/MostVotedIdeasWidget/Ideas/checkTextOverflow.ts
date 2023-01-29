import { fontSizes } from 'utils/styleUtils';

export const MEDIUM_LINE_HEIGHT = fontSizes.m + 2.45;

export default function checkTextOverflow(element: HTMLDivElement) {
  return element.clientHeight > MEDIUM_LINE_HEIGHT * 8;
}
