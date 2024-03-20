import React from 'react';

import { action } from '@storybook/addon-actions';

import ColorPickerInput from './';

export default {
  title: 'Components/ColorPickerInput',
  component: ColorPickerInput,
};

export const Default = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <ColorPickerInput
        id="color-picker"
        type="text"
        value="#000"
        onChange={action('color picked')}
        label="Color picker"
      />
    </div>
  ),

  name: 'default',
};

export const WithLabelAnbdLabelTooptip = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <ColorPickerInput
        type="text"
        value="#000"
        label="This is a very long and unnecessary label"
        labelTooltipText="this is a tooltip"
        onChange={action('color picked')}
      />
    </div>
  ),

  name: 'with label anbd label tooptip',
};
