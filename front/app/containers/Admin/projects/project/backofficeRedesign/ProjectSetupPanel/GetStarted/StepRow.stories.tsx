import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import messages from '../../messages';

import StepRow from './StepRow';

// One step of the get started checklist: an empty circle or a tick, the
// step, and a chevron. A done step greys out.

const meta = {
  title: 'Components/Redesigned/Setup panel/Step row',
  tags: ['bo', 'redesigned'],
  component: StepRow,
  args: {
    step: {
      name: 'timeline',
      label: messages.stepAddPhaseOrSurvey,
      done: false,
      onClick: fn(),
    },
    isLast: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 292, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StepRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A step still to do. */
export const Default: Story = {};

/** A step done: a tick and grey text. */
export const Done: Story = {
  args: {
    step: {
      name: 'settings',
      label: messages.stepConfigureProjectSettings,
      done: true,
      onClick: fn(),
    },
  },
};

/** Not the last step: a line under it. */
export const WithDivider: Story = {
  args: { isLast: false },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
