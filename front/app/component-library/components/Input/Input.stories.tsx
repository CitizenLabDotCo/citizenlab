import React from 'react';

import { action } from '@storybook/addon-actions';
import { text, number as numberKnob, boolean } from '@storybook/addon-knobs';

import Input from '.';

export default {
  title: 'Components/Input',
  component: Input,
};

export const Default = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="text"
        value={text('Value', 'Some random text')}
        placeholder={text('Placeholder', 'placeholder')}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'default',
};

export const WithPlaceholder = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="text"
        placeholder={text('Placeholder', 'placeholder')}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'with placeholder',
};

export const WithLabel = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="text"
        value={text('Value', 'Some random text')}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'with label',
};

export const WithMaxChar = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="text"
        value={text('Value', 'Some random text')}
        label={text('Label', 'A label')}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        maxCharCount={20}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'with max. char',
};

export const Date = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="date"
        value={text('Date', '2019-07-17')}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'date',
};

export const Email = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="email"
        value={text('Email', 'email@example.com')}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'email',
};

export const Password = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="password"
        value={text('Password', 'password')}
        disabled={boolean('Disabled', false)}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'password',
};

export const Number = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Input
        type="number"
        value={numberKnob('Number', 42)}
        disabled={boolean('Disabled', false)}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'number',
};
