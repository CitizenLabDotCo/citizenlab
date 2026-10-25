import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import { waitForText } from '../../../../../../.storybook/mocks/backofficeRedesign';
import {
  offeredHandler,
  sharedPiecesHandlers,
} from '../../../../../../.storybook/mocks/backofficeRedesignSharedPieces';

import TurnOnNotice from './TurnOnNotice';

// The dismissible callout at the top of the old project pages for admins who
// are offered the redesign but have not turned it on: it says where to
// switch it on.

// The notice stays away once dismissed (a localStorage flag): each story
// clears that flag first so the notice shows.
const STORAGE_KEY = 'project_backoffice_redesign_turn_on_notice_dismissed';

const meta = {
  title: 'Components/Redesigned/Shared pieces/Turn-on notice',
  tags: ['bo', 'redesigned'],
  component: TurnOnNotice,
  parameters: { msw: [offeredHandler, ...sharedPiecesHandlers] },
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
    await waitForText(canvasElement, 'Try the new project back office');
  },
} satisfies Meta<typeof TurnOnNotice>;

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
