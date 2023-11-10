import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import InitiativeCard from '.';

const meta = {
  title: 'Example/InitiativeCard',
  render: (props) => (
    <div style={{ maxWidth: '500px' }}>
      <InitiativeCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
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
