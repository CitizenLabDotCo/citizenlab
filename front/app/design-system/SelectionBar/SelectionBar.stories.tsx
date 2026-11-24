import React from 'react';

import Button from '../Button';

import SelectionBar from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Data display/Selection bar',
  component: SelectionBar,
  args: {
    count: 3,
    onClearSelection: () => {},
    children: (
      <>
        <Button size={28} icon="status-16">
          Status
        </Button>
        <Button size={28} icon="user-16">
          Assign
        </Button>
        <Button size={28} icon="tag-16">
          Tags
        </Button>
        <Button size={28} icon="arrow-right-16">
          Copy to phase
        </Button>
        <Button size={28} icon="message-square-16">
          Official update
        </Button>
      </>
    ),
  },
} satisfies Meta<typeof SelectionBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
