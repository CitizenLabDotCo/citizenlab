import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, waitFor } from 'storybook/test';

import MoreActionsMenu from '.';

// The default label is a translated message, which renders once the app
// configuration (MSW) has loaded, so the play step waits for it.
const meta = {
  title: 'Components/Actions/MoreActionsMenu',
  tags: ['shared'],
  parameters: { gv: {} },
  component: MoreActionsMenu,
  args: {
    actions: [
      { label: 'Edit', handler: fn(), icon: 'edit' },
      { label: 'Copy link', handler: fn(), icon: 'link' },
      { label: 'Delete', handler: fn(), icon: 'delete' },
    ],
  },
  render: (args) => (
    <Box height="220px" display="flex" justifyContent="center">
      <MoreActionsMenu {...args} />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const button = canvasElement.querySelector('.e2e-more-actions');
      if (!button?.textContent) {
        throw new Error('label not rendered yet');
      }
    });
  },
} satisfies Meta<typeof MoreActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Hover: Story = {
  parameters: { pseudo: { hover: ['.e2e-more-actions'] } },
};

export const Focus: Story = {
  parameters: { pseudo: { focus: ['.e2e-more-actions'] } },
};

export const Open: Story = {
  play: async (context) => {
    await meta.play(context);
    const button = context.canvasElement.querySelector('.e2e-more-actions');
    if (button) await userEvent.click(button);
    await waitFor(() => {
      if (!document.querySelector('[role="menuitem"]')) {
        throw new globalThis.Error('menu not open yet');
      }
    });
  },
};

export const IconOnly: Story = {
  args: { showLabel: false },
  play: async () => {},
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
