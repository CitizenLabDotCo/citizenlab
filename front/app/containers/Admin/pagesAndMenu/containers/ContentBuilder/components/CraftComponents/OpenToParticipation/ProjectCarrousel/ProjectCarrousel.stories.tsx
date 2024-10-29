import React from 'react';

import { projects } from 'api/projects/__mocks__/_mockServer';

import ProjectCarrousel from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/ProjectCarrousel',
  component: ProjectCarrousel,
  render: (props) => {
    return (
      <div style={{ width: '100%', maxWidth: '500px', padding: '8px' }}>
        <ProjectCarrousel {...props} />
      </div>
    );
  },
} satisfies Meta<typeof ProjectCarrousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    projects: [...projects.data, ...projects.data, ...projects.data].map(
      (project, index) => ({
        ...project,
        id: index.toString(),
      })
    ),
  },
};
