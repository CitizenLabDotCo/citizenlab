import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { ideaStatusesData } from 'api/idea_statuses/__mocks__/_mockServer';

import { mockCounts } from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import StatTiles from './StatTiles';

// The row of number tiles at the top of the input manager's right column:
// inputs, responded and (for ideation) accepted.

const meta = {
  title: 'Components/Redesigned/Input manager/Stat tiles',
  tags: ['bo', 'redesigned'],
  component: StatTiles,
  args: { counts: mockCounts, ideationStatuses: ideaStatusesData },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatTiles>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Ideation: inputs, responded and accepted. */
export const Default: Story = {};

/** Proposals: no accepted tile. */
export const Proposals: Story = {
  args: { ideationStatuses: undefined },
};

/** A phase with no inputs yet. */
export const Empty: Story = {
  args: {
    counts: {
      ...mockCounts,
      total: 0,
      byStatus: {},
      awaiting: 0,
      replied: 0,
      imported: 0,
      online: 0,
    },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
