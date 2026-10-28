import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { waitForText } from '../../../../../../.storybook/mocks/backofficeRedesign';
import {
  optedInHandler,
  sharedPiecesHandlers,
} from '../../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import FeedbackNotice from './FeedbackNotice';

// The dismissible callout at the top of the redesigned workspace: it says the
// admin is using the new back office and where to give feedback (a Slack
// channel) or turn it off again.

// The notice stays away once dismissed (a localStorage flag): each story
// clears that flag first so the notice shows.
const STORAGE_KEY = 'project_backoffice_redesign_feedback_notice_dismissed';

const meta = {
  title: 'Components/Redesigned/Shared pieces/Feedback notice',
  tags: ['bo', 'redesigned'],
  component: FeedbackNotice,
  parameters: { msw: [optedInHandler, ...sharedPiecesHandlers] },
  loaders: [
    () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // No storage: the notice shows anyway.
      }
      return {};
    },
  ],
  decorators: [
    (Story) => (
      <Box w="900px" p="8px" background="#F4F4F5">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'You are using the new project back office');
  },
} satisfies Meta<typeof FeedbackNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** In a narrow column: the text wraps. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <Box w="360px">
        <Story />
      </Box>
    ),
  ],
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
