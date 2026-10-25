import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { ideaStatusesData } from 'api/idea_statuses/__mocks__/_mockServer';

import {
  inputManagerHandlers,
  managedIdea,
  tagLabels,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import IdeaCell from './IdeaCell';

// One cell of the input list, drawn per column: a status with its colour
// dot, the assignee, tags, or a plain number or date.

const meta = {
  title: 'Components/Redesigned/Input manager/Idea cell',
  tags: ['bo', 'redesigned'],
  component: IdeaCell,
  parameters: { msw: inputManagerHandlers },
  args: {
    column: 'status',
    idea: managedIdea,
    status: ideaStatusesData[0],
    tagLabels,
  },
} satisfies Meta<typeof IdeaCell>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The status column. */
export const Default: Story = {};

export const Assignee: Story = {
  args: { column: 'assignee' },
  decorators: [
    // Under its column title, as in the input list.
    (Story) => (
      <Box display="flex" flexDirection="column" gap="8px">
        <Text variant="boLabel" m="0" fontWeight="bold">
          Assignee
        </Text>
        <Story />
      </Box>
    ),
  ],
};

export const Tags: Story = {
  args: { column: 'tags' },
};

export const Likes: Story = {
  args: { column: 'likes' },
};

/** Published, as a time ago. */
export const Published: Story = {
  args: { column: 'published' },
};

export const Budget: Story = {
  args: {
    column: 'budget',
    idea: {
      ...managedIdea,
      attributes: { ...managedIdea.attributes, budget: 25000 },
    },
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
