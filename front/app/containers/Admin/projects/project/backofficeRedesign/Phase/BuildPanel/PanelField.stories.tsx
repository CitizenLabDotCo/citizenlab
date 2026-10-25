import React from 'react';

import { Box, Input, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import PanelField from './PanelField';

// One labelled field of the phase build panel: a section label above
// whatever control it holds.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Panel field',
  tags: ['bo', 'redesigned'],
  component: PanelField,
  args: {
    label: 'Title',
    children: <Input type="text" value="Collect ideas" onChange={() => {}} />,
  },
  decorators: [
    (Story) => (
      <Box width="384px" p="20px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PanelField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A label over a text input. */
export const Default: Story = {};

/** A label over helper text. */
export const WithHelperText: Story = {
  args: {
    label: 'Survey form',
    children: (
      <Text variant="boHelper" m="0">
        Save the phase to add questions and import offline input.
      </Text>
    ),
  },
};

/** A long label wraps. */
export const LongContent: Story = {
  args: {
    label:
      'Information collected from participants before they can submit their idea to this phase',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { label: 'العنوان' },
};
