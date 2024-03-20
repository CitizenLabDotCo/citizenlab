import React from 'react';

import { select } from '@storybook/addon-knobs';

import { colors } from '../../utils/styleUtils';

import Box from '.';

export default {
  title: 'Components/Box',
  component: Box,
};

export const Default = {
  render: () => (
    <Box
      bgColor={select('Background color', colors, '#fff')}
      color={select('Color', colors, '#333')}
    >
      <div>Hi, I am the first child of this Box!</div>
      <div>Hi, I am the second child of this Box!</div>
    </Box>
  ),

  name: 'default',
};
