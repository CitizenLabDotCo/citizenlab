import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  ideationPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  pendingPermissionsHandler,
  postingPermissionHandler,
  timelineAndPhasesHandlers,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import AddQuestionsModal from './AddQuestionsModal';

// The modal before the form editor: what participants are asked about
// themselves (personal info, demographics), then on to the form.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Add questions modal',
  tags: ['bo', 'redesigned'],
  component: AddQuestionsModal,
  parameters: {
    msw: [postingPermissionHandler, ...timelineAndPhasesHandlers],
  },
  args: {
    projectId: project1.id,
    phaseId: ideationPhase.id,
    survey: false,
    opened: true,
    onClose: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 800 }}>
        <Story />
      </div>
    ),
  ],
  play: async () => {
    await waitForText(document.body, 'Continue to the form');
  },
} satisfies Meta<typeof AddQuestionsModal>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open, for an input form. */
export const Default: Story = {};

/** Open, for a survey form. */
export const Survey: Story = {
  args: { survey: true },
};

/** The permission is still loading. */
export const Loading: Story = {
  play: async () => {
    await waitForText(document.body, 'Information collected');
  },
  parameters: {
    msw: [pendingPermissionsHandler, ...timelineAndPhasesHandlers],
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
