import React from 'react';

import { action } from '@storybook/addon-actions';
import { text, boolean } from '@storybook/addon-knobs';

import Radio from './';

export default {
  title: 'Components/Radio',
  component: Radio,
};

export const Default = {
  render: () => (
    <Radio
      value={true}
      currentValue={boolean('Selected', true)}
      disabled={boolean('Disabled', false)}
      onChange={action('radio changed')}
      name={text('name 1')}
    />
  ),

  name: 'default',
};

export const WithLabel = {
  render: () => (
    <Radio
      value={true}
      currentValue={boolean('Selected', true)}
      disabled={boolean('Disabled', false)}
      onChange={action('radio changed')}
      name={text('name 1')}
      label={text('Label', 'A radio with label')}
    />
  ),

  name: 'with label',
};
