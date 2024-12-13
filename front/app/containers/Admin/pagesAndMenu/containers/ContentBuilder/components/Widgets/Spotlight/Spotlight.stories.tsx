import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { getOrigin } from 'utils/storybook/getOrigin';

import Spotlight from './Spotlight';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'HomepageBuilder/Spotlight',
  component: Spotlight,
  render: (props) => {
    return (
      <Box w="100%" display="flex" justifyContent="center">
        <Spotlight {...props} />
      </Box>
    );
  },
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof Spotlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    title: 'People at the Heart of Everything We Do',
    imgSrc: `${getOrigin()}/images/city.png`,
    loading: false,
    description:
      'Join local projects, sharing your ideas, or contributing to discussions, your voice is key to building a better Newham.',
    buttonText: 'Join other residents',
    avatarIds: ['1', '2'],
    userCount: 200,
  },
  parameters: {},
};
