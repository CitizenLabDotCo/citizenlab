import React, { lazy } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import PageLoading from '.';

// A lazy page that never loads, so the Suspense fallback stays on screen.
const NeverLoads = lazy(() => new Promise<never>(() => {}));

const Page = () => (
  <Box p="24px">
    <Title variant="h2" m="0px">
      Projects
    </Title>
    <Text>All the projects on this platform.</Text>
  </Box>
);

const meta = {
  title: 'Components/Feedback/PageLoading',
  tags: ['shared'],
  parameters: { gv: {}, layout: 'fullscreen' },
  component: PageLoading,
  render: (args) => (
    <Box height="600px" position="relative">
      <PageLoading {...args} />
    </Box>
  ),
} satisfies Meta<typeof PageLoading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: <Page /> },
};

// While the lazy page loads it shows the full-page spinner.
export const Loading: Story = {
  args: { children: <NeverLoads /> },
};
