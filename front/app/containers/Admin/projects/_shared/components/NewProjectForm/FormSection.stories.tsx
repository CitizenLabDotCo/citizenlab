import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import FormSection from './FormSection';

// A section of the New project form: a 12px grey caption above its
// controls, 12px apart.

const meta = {
  title: 'Components/Redesigned/New project/Form section',
  tags: ['bo', 'redesigned'],
  component: FormSection,
  args: {
    label: 'Who can find it',
    children: (
      <>
        <Text variant="boControl" m="0px">
          Public
        </Text>
        <Text variant="boControl" m="0px">
          Private
        </Text>
      </>
    ),
  },
  decorators: [
    (Story) => (
      <Box w="420px" p="24px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    label:
      'Who can open the project once it is published, and take part in its phases',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
