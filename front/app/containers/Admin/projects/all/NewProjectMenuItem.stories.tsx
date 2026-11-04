import React from 'react';

import { Box, bo, colors } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import NewProjectMenuItem from './NewProjectMenuItem';

// One item of the New project menu: a 16px grey icon and a 13px label, a
// light grey hover.

const meta = {
  title: 'Components/Redesigned/New project/New project menu item',
  tags: ['bo', 'redesigned'],
  component: NewProjectMenuItem,
  args: { icon: 'page', label: 'From scratch', onClick: fn() },
  decorators: [
    (Story) => (
      <Box
        w="200px"
        p="10px"
        background={colors.white}
        borderRadius={bo.borderRadius}
        boxShadow="0px 2px 4px -1px rgba(0,0,0,0.06)"
        border={`1px solid ${colors.grey200}`}
        role="menu"
      >
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof NewProjectMenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: ['button'] } },
};

/** Both items, as the menu lists them. */
export const Menu: Story = {
  render: (args) => (
    <>
      <NewProjectMenuItem {...args} />
      <NewProjectMenuItem {...args} icon="grid" label="Use a template" />
    </>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
