import React from 'react';

import ProjectCard from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Example/ProjectCard',
  render: (props) => (
    <div style={{ width: '700px' }}>
      <ProjectCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {
  args: {
    projectId: '2',
    size: 'large',
  },
};
