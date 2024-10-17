import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import SpotlightProject from './SpotlightProject';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/SpotlightProject',
  component: SpotlightProject,
  render: (props) => {
    return (
      <Box w="100%" display="flex" justifyContent="center">
        <SpotlightProject {...props} />
      </Box>
    );
  },
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof SpotlightProject>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    title: 'People at the Heart of Everything We Do',
    description:
      'Join local projects, sharing your ideas, or contributing to discussions, your voice is key to building a better Newham.',
    buttonText: 'Join other residents',
    avatarIds: ['1', '2'],
  },
  parameters: {},
};
