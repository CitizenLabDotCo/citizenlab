import React from 'react';

import {
  ChromePicker as ReactColorChromePicker,
  ColorResult,
} from 'react-color';

interface Props {
  color: string;
  onChange: (color: ColorResult) => void;
}

// Separate module so react-color, and the CommonJS lodash build it depends on,
// load only once a colour picker is opened. The library barrel is imported by
// most of the app, so a static import here reaches every page including the
// citizen-facing ones, which have no colour picker at all.
const ChromePicker = ({ color, onChange }: Props) => (
  <ReactColorChromePicker
    disableAlpha={true}
    color={color}
    onChange={onChange}
    onChangeComplete={onChange}
  />
);

export default ChromePicker;
