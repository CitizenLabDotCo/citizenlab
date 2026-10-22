import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Title from './';

const meta = {
  title: 'Components/Typography/Title',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Title,
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog',
  },
};

export const H2: Story = {
  args: { ...H1.args, variant: 'h2' },
};

export const H3: Story = {
  args: { ...H1.args, variant: 'h3' },
};
export const H4: Story = {
  args: { ...H1.args, variant: 'h4' },
};

export const H5: Story = {
  args: { ...H1.args, variant: 'h5' },
};

export const H6: Story = {
  args: { ...H1.args, variant: 'h6' },
};

export const Default: Story = {
  args: { children: 'Ideas from the community', variant: 'h2' },
};

export const LongContent: Story = {
  args: {
    variant: 'h2',
    children:
      "Participants can submit ideas, comment on each other's ideas and vote on the ones they want to see next",
  },
  render: (args) => (
    <div style={{ width: '320px' }}>
      <Title {...args} />
    </div>
  ),
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { variant: 'h2', children: 'أفكار من المجتمع' },
  render: (args) => (
    <div>
      <Title {...args} />
    </div>
  ),
};
