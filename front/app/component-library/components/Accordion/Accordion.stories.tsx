import React from 'react';

import { text, boolean, number } from '@storybook/addon-knobs';

import Box from '../Box';
import IconTooltip from '../IconTooltip';
import Title from '../Title';

import Accordion from '.';

export default {
  title: 'Components/Accordion',
  component: Accordion,
};

export const Default = {
  render: () => (
    <Accordion
      timeoutMilliseconds={number('TimeoutMilliseconds', 1500)}
      transitionHeightPx={number('TransitionHeightPx', 600)}
      title={
        <Box display="flex">
          <Title variant="h3">{text('Title', 'Section Title')}</Title>
          <IconTooltip
            m="8px"
            mt="16px"
            icon="info-solid"
            content="Tooltip content."
          />
        </Box>
      }
      isOpenByDefault={boolean('isOpenByDefault', false)}
    >
      {text('Text', 'Content for the section.')}
    </Accordion>
  ),

  name: 'default',
};
