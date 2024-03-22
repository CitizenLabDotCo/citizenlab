import React from 'react';

import Dropdown, { DropdownListItem } from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Dropdown',
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dropdown
      opened={true}
      onClickOutside={() => {}}
      content={
        <>
          <DropdownListItem key={1}>Item 1</DropdownListItem>
          <DropdownListItem key={2}>Item 2</DropdownListItem>
          <DropdownListItem key={3}>Item 3</DropdownListItem>
        </>
      }
    />
  ),
};
