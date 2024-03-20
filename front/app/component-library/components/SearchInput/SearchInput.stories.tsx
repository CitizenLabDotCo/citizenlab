import React from 'react';

import { action } from '@storybook/addon-actions';
import { text, number, boolean } from '@storybook/addon-knobs';

import SearchInput from './';

export default {
  title: 'Components/SearchInput',
  component: SearchInput,
};

export const Default = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <SearchInput
        debounce={number('Debounce', 500)}
        placeholder={text('Placeholder', 'placeholder')}
        ariaLabel={text('ARIA Label', 'aria label')}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'medium'}
      />
    </div>
  ),

  name: 'default',
};

export const WithDefaultValue = {
  render: () => (
    <div
      style={{
        maxWidth: '400px',
      }}
    >
      <SearchInput
        defaultValue="Default search value"
        debounce={number('Debounce', 500)}
        placeholder={text('Placeholder', 'placeholder')}
        ariaLabel={text('ARIA Label', 'aria label')}
        onChange={action('input changed')}
        size={boolean('Small', false) ? 'small' : 'medium'}
      />
    </div>
  ),

  name: 'with default value',
};
