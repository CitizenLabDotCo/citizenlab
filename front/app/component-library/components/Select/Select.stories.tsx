import React from 'react';

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import Select from './';

export default {
  title: 'Components/Select',
  component: Select,
};

export const Default = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Select
        options={[
          {
            value: 'option-1',
            label: 'Option 1',
          },
          {
            value: 'option-1',
            label: 'Option 2',
          },
        ]}
        onChange={action('Select onChange triggered')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'default',
};

export const WithSelectedOption = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Select
        options={[
          {
            value: 'option-1',
            label: 'Option 1',
          },
          {
            value: 'option-1',
            label: 'Option 2',
          },
        ]}
        value={{
          value: 'option-1',
          label: 'Option 1',
        }}
        onChange={action('Select onChange triggered')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'with selected option',
};

export const WithLabel = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Select
        label="This is a label"
        options={[
          {
            value: 'option-1',
            label: 'Option 1',
          },
          {
            value: 'option-1',
            label: 'Option 2',
          },
        ]}
        value={{
          value: 'option-1',
          label: 'Option 1',
        }}
        onChange={action('Select onChange triggered')}
        size={boolean('Small', false) ? 'small' : 'normal'}
      />
    </div>
  ),

  name: 'with label',
};

export const Disabled = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Select
        options={[
          {
            value: 'option-1',
            label: 'Option 1',
          },
          {
            value: 'option-1',
            label: 'Option 2',
          },
        ]}
        value={{
          value: 'option-1',
          label: 'Option 1',
        }}
        onChange={action('Select onChange triggered')}
        size={boolean('Small', false) ? 'small' : 'normal'}
        disabled={true}
      />
    </div>
  ),

  name: 'disabled',
};

export const WithNumberValues = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Select
        options={[
          {
            value: 1,
            label: 'Option 1',
          },
          {
            value: 2,
            label: 'Option 2',
          },
        ]}
        value={{
          value: 3,
          label: 'Option 1',
        }}
        onChange={action('Select onChange triggered')}
        size={boolean('Small', false) ? 'small' : 'normal'}
        value={2}
      />
    </div>
  ),

  name: 'with number values',
};

export const WithPlaceholder = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <Select
        options={[
          {
            value: 1,
            label: 'Option 1',
          },
          {
            value: 2,
            label: 'Option 2',
          },
        ]}
        onChange={action('Select onChange triggered')}
        size={boolean('Small', false) ? 'small' : 'normal'}
        placeholder={'Placeholder'}
      />
    </div>
  ),

  name: 'with placeholder',
};
