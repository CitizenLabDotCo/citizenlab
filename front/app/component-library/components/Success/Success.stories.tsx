import React from 'react';

import { text } from '@storybook/addon-knobs';

import Success from './';

export default {
  title: 'Components/Success',
  component: Success,
};

export const WithShortStrings = {
  render: () => (
    <Success text={text('Label', 'A Badge with label')} animate={true} />
  ),
  name: 'With short strings',
};
