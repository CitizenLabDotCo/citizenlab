import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import ProjectCard from '.';

const meta = {
  title: 'Example/ProjectCard',
  render: (props) => (
    <div style={{ maxWidth: '700px' }}>
      <ProjectCard {...props} />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ProjectCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {
  args: {
    projectId: '2',
    size: 'large',
    layout: 'dynamic',
  },
};
