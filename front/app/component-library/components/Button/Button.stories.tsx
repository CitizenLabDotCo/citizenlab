import Button from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
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

export const Success = {
  args: {
    buttonStyle: 'success',
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
