import EsriMap from '.';

import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Core/EsriMap',
  component: EsriMap,
  render: (props) => (
    <Box w="300px">
      <EsriMap {...props} />
    </Box>
  ),
  parameters: {
    chromatic: { disableSnapshot: false },
  },
} satisfies Meta<typeof EsriMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {},
};
