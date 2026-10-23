import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { waitFor } from 'storybook/test';

import Error from '.';

// The app's form error. It reads the app configuration (mocked by MSW) to
// fill API error messages, and renders nothing until that has loaded, so the
// play step waits for the message. "(UI)" keeps it apart from the library
// Error.
const meta = {
  title: 'Components/Feedback/Error (UI)',
  tags: ['shared'],
  parameters: { gv: {} },
  component: Error,
  args: { animate: false, scrollIntoView: false },
  render: (args) => (
    <div style={{ width: '480px', padding: '8px' }}>
      <Error {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        const text = canvasElement.querySelector(
          '[data-testid="error-message-text"]'
        );
        if (!text?.textContent) {
          throw new globalThis.Error('message not rendered yet');
        }
      },
      { timeout: 10000 }
    );
  },
} satisfies Meta<typeof Error>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { text: 'Please enter a title.' },
};

// API errors map to messages by error code, and several show as a list.
export const ApiErrors: Story = {
  args: {
    apiErrors: [{ error: 'blank' }, { error: 'taken' }],
  },
};

export const WithoutIcon: Story = {
  args: { ...Default.args, showIcon: false },
};

export const WithoutBackground: Story = {
  args: { ...Default.args, showBackground: false },
};

export const LongContent: Story = {
  args: {
    text: 'This email address is already linked to another account. Sign in with that account, or use a different email address to create a new one.',
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { text: 'يرجى إدخال عنوان.' },
};
