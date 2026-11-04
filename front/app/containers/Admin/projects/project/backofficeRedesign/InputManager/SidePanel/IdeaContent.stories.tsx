import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { backofficeRedesignHandlers } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import { managedIdea } from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import IdeaContent from './IdeaContent';

// What the participant wrote, in the input side panel: image, proposed
// budget, body text, location and attached files.

const meta = {
  title: 'Components/Redesigned/Input manager/Idea content',
  tags: ['bo', 'redesigned'],
  component: IdeaContent,
  parameters: { msw: backofficeRedesignHandlers },
  args: { idea: managedIdea },
  decorators: [
    (Story) => (
      <div style={{ width: 592, maxWidth: '100%', background: 'white' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof IdeaContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With a proposed budget. */
export const ProposedBudget: Story = {
  args: {
    idea: {
      ...managedIdea,
      attributes: { ...managedIdea.attributes, proposed_budget: 12000 },
    },
  },
};

export const LongContent: Story = {
  args: {
    idea: {
      ...managedIdea,
      attributes: {
        ...managedIdea.attributes,
        body_multiloc: {
          en: Array.from(
            { length: 5 },
            () =>
              '<p>The canal path gets very hot in summer and there is hardly any shade between the harbour and the old mill. A row of oaks would give shade to walkers and cyclists, cool the water, and give birds a place to nest. The verge is wide enough for trees on both sides.</p>'
          ).join(''),
        },
      },
    },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
