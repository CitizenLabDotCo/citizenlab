import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import PanelHeader from './PanelHeader';

// The sticky top bar of the input side panel: where the input is listed
// (the phase), and previous/next arrows with "3 of 12".

const meta = {
  title: 'Components/Redesigned/Input manager/Panel header',
  tags: ['bo', 'redesigned'],
  component: PanelHeader,
  args: {
    context: 'Collect ideas',
    navigation: { position: 3, total: 12, onPrevious: fn(), onNext: fn() },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640, maxWidth: '100%', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PanelHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The first input: no previous one. */
export const FirstInput: Story = {
  args: { navigation: { position: 1, total: 12, onNext: fn() } },
};

/** Opened on its own, outside a list. */
export const WithoutNavigation: Story = {
  args: { navigation: undefined },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
