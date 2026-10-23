import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent } from 'storybook/test';

import Warning from '.';

const meta = {
  title: 'Components/Feedback/Warning',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Warning,
  render: (args) => (
    <div style={{ width: '480px', padding: '8px' }}>
      <Warning {...args} />
    </div>
  ),
} satisfies Meta<typeof Warning>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Only admins can see this page.',
  },
};

export const WithLink: Story = {
  args: {
    children: (
      <span>
        This project is a draft. <a href="#publish">Publish it</a> to make it
        visible.
      </span>
    ),
  },
};

export const LinkHover: Story = {
  args: WithLink.args,
  parameters: { pseudo: { hover: ['a'] } },
};

// The link's focus style hangs on the focus-visible polyfill class, which
// only a keyboard focus sets.
export const LinkFocus: Story = {
  args: WithLink.args,
  play: async () => {
    await userEvent.tab();
  },
};

export const CustomIcon: Story = {
  args: { ...Default.args, icon: 'lock' },
};

export const WithoutIcon: Story = {
  args: { ...Default.args, hideIcon: true },
};

export const LongContent: Story = {
  args: {
    children:
      'Changes to the voting settings apply to everyone who has not voted yet. People who already voted keep their votes, so the results can mix both settings until the phase ends.',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: {
    children: 'لا يمكن رؤية هذه الصفحة إلا للمسؤولين.',
  },
};
