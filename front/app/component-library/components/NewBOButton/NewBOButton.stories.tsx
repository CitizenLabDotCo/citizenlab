import NewBOButton from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/NewBOButton',
  component: NewBOButton,
} satisfies Meta<typeof NewBOButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    buttonStyle: 'admin-dark',
    children: 'Publish',
  },
};

export const Secondary: Story = {
  args: {
    buttonStyle: 'secondary-outlined',
    children: 'Share',
  },
};

export const SecondaryWithIcon: Story = {
  args: {
    buttonStyle: 'secondary-outlined',
    icon: 'chevron-down',
    iconPos: 'right',
    children: 'Share',
  },
};

export const Status: Story = {
  args: {
    buttonStyle: 'status',
    icon: 'chevron-down',
    iconPos: 'right',
    children: 'Live',
  },
};

export const Ghost: Story = {
  args: {
    buttonStyle: 'text',
    children: 'Back to project setup',
  },
};

export const Destructive: Story = {
  args: {
    buttonStyle: 'delete',
    children: 'Reset participation data',
  },
};

export const IconOnly: Story = {
  args: {
    buttonStyle: 'text',
    icon: 'settings',
    width: '36px',
    padding: '0',
    ariaLabel: 'Project settings',
  },
};
