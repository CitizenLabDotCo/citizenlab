import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import projectMessages from 'containers/Admin/projects/project/messages';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';

import { waitForText } from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  accessPermissionsHandler,
  timelineAndPhasesHandlers,
  volunteeringPhase,
} from '../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import ParticipantActionsGroup from './ParticipantActionsGroup';

// A group in a phase's method settings listing what participants can do
// (volunteer, attend an event) and who may do each.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Participant actions group',
  tags: ['bo', 'redesigned'],
  component: ParticipantActionsGroup,
  parameters: {
    msw: [accessPermissionsHandler, ...timelineAndPhasesHandlers],
  },
  args: {
    phaseId: volunteeringPhase.id,
    actions: [
      { action: 'volunteering', label: configMessages.volunteeringAction },
      {
        action: 'attending_event',
        label: projectMessages.attendingEventAction,
      },
    ],
  },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Attending an event');
  },
} satisfies Meta<typeof ParticipantActionsGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A volunteering phase: volunteering and attending events. */
export const Default: Story = {};

/** An information phase: attending events only. */
export const SingleAction: Story = {
  args: {
    actions: [
      {
        action: 'attending_event',
        label: projectMessages.attendingEventAction,
      },
    ],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
