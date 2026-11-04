import React from 'react';

import { Button, Input, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import SetupCard from './SetupCard';

// The bordered card every section of the event setup panel sits in: a
// small title, an optional action on the right, then the fields.

const meta = {
  title: 'Components/Redesigned/Events/Setup card',
  tags: ['bo', 'redesigned'],
  component: SetupCard,
  args: {
    title: 'Event location',
    children: (
      <Input
        id="setup-card-story-input"
        variant="bo"
        type="text"
        label="Online link"
        placeholder="https://..."
        value=""
        onChange={fn()}
      />
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, padding: 18, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SetupCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A title with a field below. */
export const Default: Story = {};

/** An action on the right of the title, as the attachments card has. */
export const WithAction: Story = {
  args: {
    title: 'Attachments',
    action: (
      <Button
        buttonStyle="bo-text"
        icon="plus"
        iconSize="16px"
        width="28px"
        height="28px"
        padding="0"
        ariaLabel="Add a file"
        onClick={fn()}
      />
    ),
    children: undefined,
  },
};

/** Only the title row, when there is nothing in the card yet. */
export const Empty: Story = {
  args: { title: 'Attachments', children: undefined },
};

export const LongContent: Story = {
  args: {
    title: 'A section title long enough to need more than one line',
    children: (
      <Text m="0" fontSize="xs">
        Some explanation in the card, long enough to wrap over several lines
        so the padding around it shows.
      </Text>
    ),
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
