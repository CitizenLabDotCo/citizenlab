import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import PreviewInfoRow from './PreviewInfoRow';

// One line of the information card in the event preview: an icon, then
// what it stands for (the place, the link, the number of people coming).

const meta = {
  title: 'Components/Redesigned/Events/Preview info row',
  tags: ['bo', 'redesigned'],
  component: PreviewInfoRow,
  args: {
    icon: 'position',
    children: (
      <Text m="0" fontSize="s">
        Park gate, Koekenbakstraat 1, Antwerp
      </Text>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 290, padding: 16, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PreviewInfoRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The place of the event. */
export const Default: Story = {};

/** No place yet: the icon fades. */
export const Empty: Story = {
  args: {
    empty: true,
    children: (
      <Text m="0" fontSize="s" color="coolGrey300">
        Location
      </Text>
    ),
  },
};

export const LongContent: Story = {
  args: {
    icon: 'link',
    children: (
      <Text m="0" fontSize="s">
        https://meet.example.org/a-very-long-meeting-link-for-the-tree-plan-session
      </Text>
    ),
  },
};
