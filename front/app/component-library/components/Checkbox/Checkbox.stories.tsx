import React from 'react';

import { action } from '@storybook/addon-actions';

import Checkbox from '.';

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
};

export const Default = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Checkbox onChange={action('checkbox clicked')} />
    </div>
  ),

  name: 'default',
};

export const Checked = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Checkbox checked={true} onChange={action('checkbox clicked')} />
    </div>
  ),

  name: 'checked',
};

export const Indeterminate = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <Checkbox indeterminate={true} onChange={action('checkbox clicked')} />
    </div>
  ),

  name: 'indeterminate',
};
