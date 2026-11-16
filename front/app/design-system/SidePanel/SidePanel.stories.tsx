import React from 'react';

import { DialogTrigger } from 'react-aria-components';

import Button from '../Button';
import { ListBoxOption } from '../ListBox';
import Select from '../Select';
import TextField from '../TextField';

import SidePanel from '.';

import type { Meta, StoryObj } from '@storybook/react';

// The _Side panel body · Folder settings example.
const FolderSettings = () => (
  <>
    <TextField
      label="Folder name"
      defaultValue="Parks and green spaces"
      description="Residents see it above the projects inside."
    />
    <Select label="Status" defaultValue="published">
      <ListBoxOption id="published">Published</ListBoxOption>
      <ListBoxOption id="draft">Draft</ListBoxOption>
      <ListBoxOption id="archived">Archived</ListBoxOption>
    </Select>
  </>
);

const meta = {
  title: 'Design system/Overlays/Side panel',
  component: SidePanel,
  args: {
    title: 'Folder settings',
    children: <FolderSettings />,
    primaryAction: { label: 'Save', onPress: (close) => close() },
    secondaryAction: { label: 'Cancel' },
    defaultOpen: true,
  },
} satisfies Meta<typeof SidePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTrigger: Story = {
  args: { defaultOpen: undefined },
  render: (args) => (
    <DialogTrigger>
      <Button>Folder settings</Button>
      <SidePanel {...args} />
    </DialogTrigger>
  ),
};
