import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import Success from './';

const meta = {
  title: 'Components/Feedback/Success',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Success,
  render: (args) => (
    <div style={{ width: '400px' }}>
      <Success {...args} />
    </div>
  ),
} satisfies Meta<typeof Success>;

export default meta;
type Story = StoryObj<typeof meta>;

// `animate: false` so the message shows at once, without the enter transition.
export const Default: Story = {
  args: {
    text: 'Your changes have been saved.',
    showIcon: true,
    showBackground: true,
    animate: false,
  },
};

export const WithShortStrings: Story = {
  args: {
    text: 'A Badge with label',
    animate: true,
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    text: 'Your proposal has been submitted. The moderators review every proposal before it is published, and you will receive an email as soon as it is visible to other participants.',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, text: 'تم حفظ التغييرات.' },
};
