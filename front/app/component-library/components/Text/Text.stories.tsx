import React from 'react';

import { text, select } from '@storybook/addon-knobs';

import { colors, fontSizes } from '../../utils/styleUtils';

import Text from './';
const fontSizeOptions = [undefined, ...Object.keys(fontSizes)];
const fontWeights = ['bold', 'normal'];

const textAlignOptions = [
  'left',
  'right',
  'center',
  'justify',
  'initial',
  'inherit',
];

export default {
  title: 'Components/Text',
  component: Text,
};

export const BodyL = {
  render: () => (
    <div>
      <Text
        color={select('Text color', [...Object.keys(colors)], 'text')}
        fontSize={select('Font size', fontSizeOptions)}
        fontWeight={select('Font weight', fontWeights, 'normal')}
        textAlign={select('Text align', textAlignOptions)}
        variant="bodyL"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Text>
    </div>
  ),

  name: 'bodyL',
};

export const BodyM = {
  render: () => (
    <div>
      <Text
        color={select('Text color', [...Object.keys(colors)], 'text')}
        fontSize={select('Font size', fontSizeOptions)}
        fontWeight={select('Font weight', fontWeights, 'normal')}
        textAlign={select('Text align', textAlignOptions)}
        variant="bodyM"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Text>
    </div>
  ),

  name: 'bodyM',
};

export const BodyS = {
  render: () => (
    <div>
      <Text
        color={select('Text color', [...Object.keys(colors)], 'text')}
        fontSize={select('Font size', fontSizeOptions)}
        fontWeight={select('Font weight', fontWeights, 'normal')}
        textAlign={select('Text align', textAlignOptions)}
        variant="bodyS"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Text>
    </div>
  ),

  name: 'bodyS',
};

export const BodyXs = {
  render: () => (
    <div>
      <Text
        color={select('Text color', [...Object.keys(colors)], 'text')}
        fontSize={select('Font size', fontSizeOptions)}
        fontWeight={select('Font weight', fontWeights, 'normal')}
        textAlign={select('Text align', textAlignOptions)}
        variant="bodyXs"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Text>
    </div>
  ),

  name: 'bodyXs',
};
