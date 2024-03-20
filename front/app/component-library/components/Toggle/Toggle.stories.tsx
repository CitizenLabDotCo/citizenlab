import React from 'react';

import { action } from '@storybook/addon-actions';
import { text, boolean } from '@storybook/addon-knobs';

import { colors } from '../../utils/styleUtils';

import Toggle from './';

export default {
  title: 'Components/Toggle',
  component: Toggle,
};

export const Default = {
  render: () => (
    <Toggle
      checked={boolean('Checked', false)}
      onChange={action('toggle changed')}
    />
  ),
  name: 'default',
};

export const WithLabel = {
  render: () => (
    <Toggle
      checked={boolean('Checked', false)}
      label={text('Label', 'A toggle with label')}
      onChange={action('toggle changed')}
    />
  ),

  name: 'with label',
};

export const Disabled = {
  render: () => (
    <Toggle
      checked={boolean('Checked', false)}
      disabled={boolean('Disabled', true)}
      onChange={action('toggle changed')}
    />
  ),

  name: 'disabled',
};

export const WithLabelTextColor = {
  render: () => (
    <Toggle
      checked={boolean('Checked', false)}
      disabled={boolean('Disabled', false)}
      onChange={action('toggle changed')}
      label={text('Label', 'A toggle with colored label')}
      labelTextColor={text('Label Color', colors.textSecondary)}
    />
  ),

  name: 'with label text color',
};
