import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from 'storybook/test';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForText,
} from '../../../../../../.storybook/mocks/backofficeRedesign';
import {
  accessPermissionsHandler,
  postingPermissionHandler,
} from '../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import PhaseActionAccess from './PhaseActionAccess';

// Who can do one thing in a phase, as a one-line text link ("Sign-in
// required", "Anyone can participate") with a chevron. It opens a modal
// with the full access form for that action.

const meta = {
  title: 'Components/Redesigned/Settings panel/Phase action access',
  tags: ['bo', 'redesigned'],
  component: PhaseActionAccess,
  parameters: {
    msw: [postingPermissionHandler, ...backofficeRedesignHandlers],
  },
  args: { phaseId: ideationPhase.id, action: 'posting_idea' },
  decorators: [
    (Story) => (
      <Box w="332px" p="16px" background="white">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Sign-in required');
  },
} satisfies Meta<typeof PhaseActionAccess>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Posting needs an account: "Sign-in required". */
export const Default: Story = {};

/** Attending events is open to everyone. */
export const Anyone: Story = {
  parameters: {
    msw: [accessPermissionsHandler, ...backofficeRedesignHandlers],
  },
  args: { action: 'attending_event' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Anyone can participate');
  },
};

/** The link clicked: the access form in its modal. */
export const Open: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Box h="900px">
        <Story />
      </Box>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Sign-in required');
    await userEvent.click(within(canvasElement).getByRole('button'));
    await waitForText(document.body, 'Submitting');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
