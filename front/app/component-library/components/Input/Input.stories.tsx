import React from 'react';

import { text, boolean } from '@storybook/addon-knobs';

import Input from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Input',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
        onChange={() => {}}
        size={'small'}
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
        onChange={() => {}}
        size={'small'}
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
        onChange={() => {}}
        size={'small'}
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
        onChange={() => {}}
        size={'small'}
        maxCharCount={20}
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
        onChange={() => {}}
        size={'small'}
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
        onChange={() => {}}
        size={'small'}
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
        onChange={() => {}}
        size={'small'}
      />
    </div>
  ),

  name: 'password',
};
