import React from 'react';

import InitiativeCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Example/InitiativeCard',
  render: (props) => (
    <div style={{ width: '400px', height: '300px' }}>
      <InitiativeCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof InitiativeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    initiativeId: '2',
  },
  parameters: {},
};
