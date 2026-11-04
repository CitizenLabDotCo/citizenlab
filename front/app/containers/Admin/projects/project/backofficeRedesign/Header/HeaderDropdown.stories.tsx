import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import HeaderDropdown from './HeaderDropdown';

// The button-with-a-panel used on the right of the workspace header: Share
// and Publish are both built on it. The panel opens under the button,
// aligned to its right edge.

const content = (
  <Box>
    <Text variant="boSection" mb="8px">
      Panel title
    </Text>
    <Text variant="boHelper" m="0">
      Whatever the dropdown holds: the share or publish panel in the header.
    </Text>
  </Box>
);

const meta = {
  title: 'Components/Redesigned/Project header/Header dropdown',
  tags: ['bo', 'redesigned'],
  component: HeaderDropdown,
  args: {
    opened: false,
    onOpenChange: fn(),
    label: 'Share',
    buttonStyle: 'bo-secondary',
    icon: 'chevron-down',
    id: 'story-header-dropdown',
    width: '320px',
    content,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 360,
          minHeight: 200,
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ position: 'relative', display: 'flex' }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof HeaderDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Closed: just the secondary trigger button. */
export const Default: Story = {};

/** Opened: the panel under the button. */
export const Open: Story = {
  args: { opened: true },
};

/** A primary trigger, as Publish uses on a draft project. */
export const Primary: Story = {
  args: { label: 'Publish', buttonStyle: 'bo-primary' },
};

export const RTL: Story = {
  args: { opened: true },
  globals: { lang: 'ar' },
};
