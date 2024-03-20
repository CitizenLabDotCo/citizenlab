import React from 'react';

import { action } from '@storybook/addon-actions';

import LocaleSwitcher from './';

export default {
  title: 'Components/LocaleSwitcher',
  component: LocaleSwitcher,
};

export const Default = {
  render: () => (
    <div
      style={{
        maxWidth: '150px',
      }}
    >
      <LocaleSwitcher
        onSelectedLocaleChange={action('selected locale changed')}
        locales={['en-GB', 'nl-BE']}
        selectedLocale="en-GB"
        values={{
          bleh: {
            'en-GB': '',
            'nl-BE': '',
          },
        }}
      />
    </div>
  ),

  name: 'default',
};

export const WithANoneEmptyValue = {
  render: () => (
    <div
      style={{
        maxWidth: '150px',
      }}
    >
      <LocaleSwitcher
        onSelectedLocaleChange={action('selected locale changed')}
        locales={['en-GB', 'nl-BE']}
        selectedLocale="en-GB"
        values={{
          bleh: {
            'en-GB': '',
            'nl-BE': 'Een willekeurige waarde',
          },
        }}
      />
    </div>
  ),

  name: 'with a none-empty value',
};
