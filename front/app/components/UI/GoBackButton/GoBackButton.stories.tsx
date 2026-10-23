import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import GoBackButton from '.';

const meta = {
  title: 'Components/Navigation/GoBackButton',
  tags: ['shared'],
  parameters: { gv: {} },
  component: GoBackButton,
  args: { onClick: fn() },
} satisfies Meta<typeof GoBackButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// With only `onClick` it renders a text-style button.
export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  parameters: { pseudo: { focus: ['button'], focusVisible: ['button'] } },
};

export const IconOnly: Story = {
  args: { showGoBackText: false },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
