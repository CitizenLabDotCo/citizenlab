import React from 'react';
import { fontSizes } from 'utils/styleUtils';

export const MEDIUM_LINE_HEIGHT = fontSizes.m + 2.45;

export default function checkTextOverflow(ref: React.MutableRefObject<any>) {
  return ref.current.clientHeight > MEDIUM_LINE_HEIGHT * 8;
}
