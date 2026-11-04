import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import ErrorMessage from './';

const meta = {
  title: 'Components/Feedback/Error',
  tags: ['shared'],
  parameters: { gv: {} },
  component: ErrorMessage,
  // The component's defaultProps, which the props type lists as required.
  args: {
    marginTop: '3px',
    marginBottom: '0px',
    showIcon: true,
    showBackground: true,
    className: '',
  },
  render: (args) => (
    <div style={{ width: '400px' }}>
      <ErrorMessage {...args} />
    </div>
  ),
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

// `animate: false` so the message shows at once, without the enter transition.
export const Default: Story = {
  args: {
    text: 'This field is required.',
    animate: false,
  },
};

export const LongContent: Story = {
  args: {
    ...Default.args,
    text: 'The file could not be uploaded because it is larger than the maximum size of 50 MB. Choose a smaller file or compress it, then try again.',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { ...Default.args, text: 'هذا الحقل مطلوب.' },
};
