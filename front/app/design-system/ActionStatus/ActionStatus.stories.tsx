import ActionStatus from '.';

import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design system/Status & feedback/Action status',
  component: ActionStatus,
  args: {
    state: 'busy',
    message: 'Updating 3 ideas…',
    onDismiss: () => {},
  },
} satisfies Meta<typeof ActionStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Busy: Story = {};

export const Done: Story = {
  args: { state: 'done', message: '3 ideas marked as Accepted' },
};

export const Failed: Story = {
  args: { state: 'failed', message: 'Could not update 1 of 3. Please try again.' },
};
