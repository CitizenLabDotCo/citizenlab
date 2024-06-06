import { Meta, StoryObj } from '@storybook/react';

import Title from './';

const meta = {
  title: 'Components/Title',
  component: Title,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

export const H2: Story = {
  args: { ...H1.args, styleVariant: 'h2' },
};

export const H3: Story = {
  args: { ...H1.args, styleVariant: 'h3' },
};
export const H4: Story = {
  args: { ...H1.args, styleVariant: 'h4' },
};

export const H5: Story = {
  args: { ...H1.args, styleVariant: 'h5' },
};

export const H6: Story = {
  args: { ...H1.args, styleVariant: 'h6' },
};
