import React from 'react';

import { text, select } from '@storybook/addon-knobs';

import { colors, fontSizes } from '../../utils/styleUtils';

import Title from './';
const colorOptions = [...Object.keys(colors)];
const fontSizeOptions = [undefined, ...Object.keys(fontSizes)];

const textAlignOptions = [
  'left',
  'right',
  'center',
  'justify',
  'initial',
  'inherit',
];

export default {
  title: 'Components/Title',
  component: Title,
};

export const H1 = {
  render: () => (
    <div>
      <Title
        color={select('Title color', colorOptions, 'adminTextColor')}
        fontSize={select('Font size', fontSizeOptions)}
        textAlign={select('Text align', textAlignOptions)}
        variant="h1"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Title>
    </div>
  ),

  name: 'h1',
};

export const H2 = {
  render: () => (
    <div>
      <Title
        color={select('Title color', colorOptions, 'adminTextColor')}
        fontSize={select('Font size', fontSizeOptions)}
        textAlign={select('Text align', textAlignOptions)}
        variant="h2"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Title>
    </div>
  ),

  name: 'h2',
};

export const H3 = {
  render: () => (
    <div>
      <Title
        color={select('Title color', colorOptions, 'adminTextColor')}
        fontSize={select('Font size', fontSizeOptions)}
        textAlign={select('Text align', textAlignOptions)}
        variant="h3"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Title>
    </div>
  ),

  name: 'h3',
};

export const H4 = {
  render: () => (
    <div>
      <Title
        color={select('Title color', colorOptions, 'adminTextColor')}
        fontSize={select('Font size', fontSizeOptions)}
        textAlign={select('Text align', textAlignOptions)}
        variant="h4"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Title>
    </div>
  ),

  name: 'h4',
};

export const H5 = {
  render: () => (
    <div>
      <Title
        color={select('Title color', colorOptions, 'adminTextColor')}
        fontSize={select('Font size', fontSizeOptions)}
        textAlign={select('Text align', textAlignOptions)}
        variant="h5"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Title>
    </div>
  ),

  name: 'h5',
};

export const H6 = {
  render: () => (
    <div>
      <Title
        color={select('Title color', colorOptions, 'adminTextColor')}
        fontSize={select('Font size', fontSizeOptions)}
        textAlign={select('Text align', textAlignOptions)}
        variant="h6"
      >
        {text('Text', 'The quick brown fox jumps over the lazy dog')}
      </Title>
    </div>
  ),

  name: 'h6',
};
