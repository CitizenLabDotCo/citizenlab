import React from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import PanelGroup from './PanelGroup';
import PanelRow from './PanelRow';

// A collapsible group of the setup panel: a row with a 14px semibold title
// and a chevron, a thin grey line above, and its settings below when open.
// Listing and Topic tags on the project page are groups like this.

const Settings = () => (
  <Box display="flex" flexDirection="column" gap="12px">
    <Toggle checked label="Show on the homepage" onChange={() => undefined} />
    <Toggle checked={false} label="Allow comments" onChange={() => undefined} />
    <Text variant="boHelper" m="0px">
      Residents see the project in the list of open projects.
    </Text>
  </Box>
);

const meta = {
  title: 'Components/Redesigned/Settings panel/Panel group',
  tags: ['bo', 'redesigned'],
  component: PanelGroup,
  args: { label: 'Listing', defaultOpen: true, children: <Settings /> },
  decorators: [
    (Story) => (
      <Box w="332px" px="16px" background="white">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PanelGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, with its settings. */
export const Default: Story = {};

/** Closed: only the title row. */
export const Closed: Story = {
  args: { defaultOpen: false },
};

/** Opened by a click. */
export const Toggled: Story = {
  args: { defaultOpen: false },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
  },
};

/** Several groups and rows stacked, as in the setup panel. */
export const Stack: Story = {
  render: (args) => (
    <>
      <PanelGroup {...args} />
      <PanelGroup label="Topic tags">
        <Settings />
      </PanelGroup>
      <PanelRow label="Participant actions" onClick={() => undefined} />
    </>
  ),
};

export const LongContent: Story = {
  args: {
    label:
      'Who can see the project, find it in the list and take part in its phases',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
