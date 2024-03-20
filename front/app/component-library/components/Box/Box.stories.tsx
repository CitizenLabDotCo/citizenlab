import React from 'react';

import { select, boolean, text, number } from '@storybook/addon-knobs';

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
      opacity={number('Opacity')}
      p={text('Padding')}
      pt={text('Padding top')}
      pl={text('Padding left')}
      pr={text('Padding right')}
      pb={text('Padding bottom')}
      px={text('Padding X')}
      py={text('Padding Y')}
      m={text('Margin')}
      mt={text('Margin top')}
      ml={text('Margin left')}
      mr={text('Margin right')}
      mb={text('Margin bottom')}
      mx={text('Margin X')}
      my={text('Margin Y')}
      w={text('Width')}
      h={text('Height')}
      maxWidth={text('Max width')}
      maxHeight={text('Max height')}
      minWidth={text('Min width')}
      minHeight={text('Min height')}
      overflow={select('Overflow', [
        'visible',
        'hidden',
        'scroll',
        'auto',
        'initial',
        'inherit',
      ])}
      display={select('Display', [
        'block',
        'inline-block',
        'inline',
        'flex',
        'inline-flex',
        'none',
        'inherit',
      ])}
      flexDirection={select('Flex direction', [
        'row',
        'row-reverse',
        'column',
        'column-reverse',
      ])}
      justifyContent={select('Justify content', [
        'flex-start',
        'flex-end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ])}
      alignItems={select('Align items', [
        'flex-start',
        'flex-end',
        'center',
        'baseline',
        'stretch',
      ])}
      position={select('Position', [
        'static',
        'relative',
        'fixed',
        'absolute',
        'sticky',
      ])}
      top={text('Top')}
      left={text('Left')}
      right={text('Right')}
      bottom={text('Bottom')}
      border={text('Border')}
      visibility={boolean('Visibility', true) ? 'visible' : 'hidden'}
      gap={text('Gap')}
    >
      <div>Hi, I am the first child of this Box!</div>
      <div>Hi, I am the second child of this Box!</div>
    </Box>
  ),

  name: 'default',
};
