import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Meta, StoryObj } from '@storybook/react';

import projectMessages from 'containers/Admin/projects/project/messages';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';

import {
  backofficeRedesignHandlers,
  ideationPhase,
  waitForText,
} from '../../../../../../.storybook/mocks/backofficeRedesign';
import { accessPermissionsHandler } from '../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import PhaseActionAccessRow from './PhaseActionAccessRow';

// One participant action in a phase's settings: the action's name, and
// under it who can do it as a text link that opens the access form.

const meta = {
  title: 'Components/Redesigned/Settings panel/Phase action access row',
  tags: ['bo', 'redesigned'],
  component: PhaseActionAccessRow,
  parameters: {
    msw: [accessPermissionsHandler, ...backofficeRedesignHandlers],
  },
  args: {
    phaseId: ideationPhase.id,
    action: 'volunteering',
    label: configMessages.volunteeringAction,
  },
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
} satisfies Meta<typeof PhaseActionAccessRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Volunteering: sign-in required. */
export const Default: Story = {};

/** Attending events: anyone. */
export const Anyone: Story = {
  args: {
    action: 'attending_event',
    label: projectMessages.attendingEventAction,
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Anyone can participate');
  },
};

/** Both rows, as the participant actions group lists them. */
export const List: Story = {
  render: (args) => (
    <>
      <PhaseActionAccessRow {...args} />
      <PhaseActionAccessRow
        {...args}
        action="attending_event"
        label={projectMessages.attendingEventAction}
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Anyone can participate');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => undefined,
};
