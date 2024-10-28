import React from 'react';

import ProjectCarrousel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/ProjectCarrousel',
  component: ProjectCarrousel,
  render: () => {
    return (
      <div
        style={{ width: '500px', padding: '20px', backgroundColor: '#f3f3f3' }}
      >
        <ProjectCarrousel />
      </div>
    );
  },
} satisfies Meta<typeof ProjectCarrousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
