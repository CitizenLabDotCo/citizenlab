import React from 'react';

import { Table, Tbody } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { ideaStatusesData } from 'api/idea_statuses/__mocks__/_mockServer';

import { waitForText } from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  inputManagerHandlers,
  managedIdea,
  tagLabels,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignInputManager';

import IdeaRow from './IdeaRow';

// One input in the input list: checkbox, title, then a cell per visible
// column. Clicking the row opens the input in the side panel.

const meta = {
  title: 'Components/Redesigned/Input manager/Idea row',
  tags: ['bo', 'redesigned'],
  component: IdeaRow,
  parameters: { msw: inputManagerHandlers },
  args: {
    idea: managedIdea,
    columns: ['status', 'assignee', 'tags', 'likes', 'comments', 'published'],
    statuses: ideaStatusesData,
    tagLabels,
    selected: false,
    active: false,
    onToggleSelect: fn(),
    onOpen: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 960, maxWidth: '100%', background: 'white' }}>
        <Table>
          <Tbody>
            <Story />
          </Tbody>
        </Table>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Plant oaks along the canal');
  },
} satisfies Meta<typeof IdeaRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { selected: true },
};

/** Open in the side panel. */
export const Active: Story = {
  args: { active: true },
};

/** With the replied mark: a speech bubble after the title. */
export const RepliedMark: Story = {
  args: {
    columns: ['status', 'assignee', 'replied'],
    idea: {
      ...managedIdea,
      attributes: { ...managedIdea.attributes, official_feedbacks_count: 1 },
    },
  },
};

export const LongContent: Story = {
  args: {
    idea: {
      ...managedIdea,
      attributes: {
        ...managedIdea.attributes,
        title_multiloc: {
          en: 'Plant a double row of oaks and lime trees along the whole length of the canal, from the harbour to the old mill, with benches every hundred metres',
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Plant a double row');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
};
