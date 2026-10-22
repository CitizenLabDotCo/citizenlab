import React from 'react';

import Button from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['shared'],
  parameters: { gv: {} },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    buttonStyle: 'primary',
    children: 'Button',
  },
};

export const PrimaryWithIcon = {
  args: {
    buttonStyle: 'primary',
    icon: 'info-outline',
    children: 'Button',
  },
};

export const PrimaryOutlined = {
  args: {
    buttonStyle: 'primary-outlined',
    children: 'Button',
  },
};

export const PrimaryInverse = {
  args: {
    buttonStyle: 'primary-inverse',
    children: 'Button',
  },
};

export const SecondaryOutlined = {
  args: {
    buttonStyle: 'secondary-outlined',
    children: 'Button',
  },
};

export const TextStyle = {
  args: {
    buttonStyle: 'text',
    children: 'Button',
  },
};

export const AdminDark = {
  args: {
    buttonStyle: 'admin-dark',
    children: 'Button',
  },
};

export const AdminDarkText = {
  args: {
    buttonStyle: 'admin-dark-text',
    children: 'Button',
  },
};

export const Delete = {
  args: {
    buttonStyle: 'delete',
    children: 'Button',
  },
};

export const White = {
  args: {
    buttonStyle: 'white',
    children: 'Button',
  },
};

export const ButtonLink = {
  args: {
    buttonStyle: 'primary',
    as: 'a',
    href: 'https://citizenlab.co/',
    children: 'Button that is actually a link',
  },
};

export const BackOfficePrimary = {
  args: {
    buttonStyle: 'bo-primary',
    children: 'Publish',
  },
};

export const BackOfficeSecondary = {
  args: {
    buttonStyle: 'bo-secondary',
    children: 'Share',
  },
};

export const BackOfficeSecondaryWithIcon = {
  args: {
    buttonStyle: 'bo-secondary',
    icon: 'chevron-down',
    iconPos: 'right',
    children: 'Share',
  },
};

export const BackOfficeStatus = {
  args: {
    buttonStyle: 'bo-status',
    icon: 'chevron-down',
    iconPos: 'right',
    children: 'Live',
  },
};

export const BackOfficeText = {
  args: {
    buttonStyle: 'bo-text',
    children: 'Back to project setup',
  },
};

export const BackOfficeDelete = {
  args: {
    buttonStyle: 'bo-delete',
    children: 'Reset participation data',
  },
};

export const BackOfficeIconOnly = {
  args: {
    buttonStyle: 'bo-text',
    icon: 'settings',
    width: '36px',
    padding: '0',
    ariaLabel: 'Project settings',
  },
};

export const Default: Story = {
  args: {
    buttonStyle: 'primary',
    children: 'Save changes',
  },
};

export const Hover: Story = {
  args: Default.args,
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  args: Default.args,
  parameters: { pseudo: { focusVisible: ['button'] } },
};

export const Active: Story = {
  args: Default.args,
  parameters: { pseudo: { active: true } },
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
};

export const Loading: Story = {
  args: { ...Default.args, processing: true },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    children:
      'Save the changes to this phase and publish the project to every participant in the selected groups',
    whiteSpace: 'normal',
    width: '240px',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, icon: 'info-outline', children: 'حفظ التغييرات' },
  render: (args) => (
    <div>
      <Button {...args} />
    </div>
  ),
};
