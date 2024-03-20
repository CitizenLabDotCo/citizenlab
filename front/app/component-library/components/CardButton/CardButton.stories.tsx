import React from 'react';

import { action } from '@storybook/addon-actions';

import CardButton from '.';

export default {
  title: 'Components/CardButton',
  component: CardButton,
};

export const Default = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <CardButton
        iconName="close"
        title="Close"
        subtitle="close"
        onClick={action('Close CardButton clicked')}
        mr="8px"
        selected
      />
      <CardButton
        iconName="copy"
        title="Copy"
        subtitle="copy"
        onClick={action('Copy CardButton clicked')}
      />
    </div>
  ),

  name: 'default',
};

export const LongTitle = {
  render: () => (
    <div
      style={{
        display: 'flex',
      }}
    >
      <CardButton
        iconName="close"
        title="Looong title with many words and such"
        subtitle="close"
        onClick={action('Close CardButton clicked')}
        mr="8px"
        selected
      />
    </div>
  ),

  name: 'long title',
};
