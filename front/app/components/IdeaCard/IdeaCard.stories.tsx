import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import IdeaCard from '.';

const meta = {
  title: 'Example/IdeaCard',
  render: (props) => (
    <div style={{ maxWidth: '500px' }}>
      <IdeaCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof IdeaCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    ideaId: '1',
  },
  parameters: {},
};
