import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import EmptyState from './EmptyState';

// What a phase view shows before there is anything in it: the large one in
// the main area, the small one in the side panel.

const PhaseEmptyState = ({ size }: { size: 'large' | 'small' }) => {
  const { formatMessage } = useIntl();
  return size === 'large' ? (
    <EmptyState
      size="large"
      title={formatMessage(messages.noInputsYet)}
      description={formatMessage(messages.noInputsYetDescription)}
    />
  ) : (
    <EmptyState
      size="small"
      description={formatMessage(messages.recommendedActionsHint)}
    />
  );
};

const meta = {
  title: 'Components/Redesigned/Phase empty state',
  tags: ['bo'],
  component: PhaseEmptyState,
  args: { size: 'large' },
  decorators: [
    (Story) => (
      <div style={{ height: 400, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhaseEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The main area of a view with no inputs. */
export const Default: Story = {};

/** The side panel, with no recommended actions yet. */
export const Small: Story = {
  args: { size: 'small' },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
