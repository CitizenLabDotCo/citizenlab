import { Meta, StoryObj } from '@storybook/react';
import { fn, waitFor } from 'storybook/test';

import CloseIconButton from '.';

// It renders once the app configuration (MSW) has loaded, so the play step
// waits for the button.
const meta = {
  title: 'Components/Actions/CloseIconButton',
  tags: ['shared'],
  parameters: { gv: {} },
  component: CloseIconButton,
  args: { onClick: fn() },
  play: async ({ canvasElement }) => {
    await waitFor(
      () => {
        if (!canvasElement.querySelector('button')) {
          throw new Error('button not rendered yet');
        }
      },
      { timeout: 10000 }
    );
  },
} satisfies Meta<typeof CloseIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: ['button'] } },
};

export const Focus: Story = {
  parameters: { pseudo: { focus: ['button'], focusVisible: ['button'] } },
};

// On full-screen views the close button is a back arrow.
export const FullScreen: Story = {
  args: { fullScreen: true },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  args: { fullScreen: true },
};
