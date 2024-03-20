import React from 'react';

import { text } from '@storybook/addon-knobs';

import Badge from '.';

export default {
  title: 'Components/Badge',
  component: Badge,
};

export const Default = {
  render: () => <Badge>{text('Label', 'A Badge with label')}</Badge>,
  name: 'default',
};

export const Inverted = {
  render: () => (
    <Badge className="inverse">{text('Label', 'A Badge with label')}</Badge>
  ),
  name: 'inverted',
};
