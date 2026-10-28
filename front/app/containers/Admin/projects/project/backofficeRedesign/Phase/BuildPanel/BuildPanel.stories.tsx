import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  ideationPhase,
  votingPhase,
  waitForText,
  withAllLocales,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  answeredSurveyPhase,
  commonGroundPhase,
  infoPhaseWithReport,
  pollPhase,
  surveyPhase,
  timelineAndPhasesHandlers,
  volunteeringPhase,
  withPhaseRoute,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';
import { PageSaveProvider } from '../../_shared/PageSaveContext';

import BuildPanel from '.';

// The Build tab of a saved phase's side panel: dates, title, description,
// attachments, then what the phase's method needs (its form, poll
// questions, causes, report).

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Build panel',
  tags: ['bo', 'redesigned'],
  component: BuildPanel,
  parameters: { msw: timelineAndPhasesHandlers },
  args: { projectId: project1.id, phase: ideationPhase, savedAttachments: [] },
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div style={{ width: 384, background: 'white' }}>
          <Story />
        </div>
      </PageSaveProvider>
    ),
    withAllLocales,
    withPhaseRoute,
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Input form');
  },
} satisfies Meta<typeof BuildPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase: its input form and offline collection. */
export const Default: Story = {};

/** A voting phase: ideas can also come from an earlier phase. */
export const Voting: Story = {
  args: { phase: votingPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Add ideas from previous phase');
  },
};

/** A native survey: the choice of survey kind, then the survey form. */
export const Survey: Story = {
  args: { phase: surveyPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Survey form');
  },
};

/** A survey with responses: the other survey kinds are locked. */
export const SurveyWithResponses: Story = {
  args: { phase: answeredSurveyPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Survey form');
  },
};

/** A poll: its questions. */
export const Poll: Story = {
  args: { phase: pollPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Poll questions');
  },
};

/** Volunteering: the causes people can sign up for. */
export const Volunteering: Story = {
  args: { phase: volunteeringPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Dig the planting holes');
  },
};

/** Common ground: create inputs or start from past ones. */
export const CommonGround: Story = {
  args: { phase: commonGroundPhase },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Inputs');
  },
};

/** An information phase: its report. */
export const Information: Story = {
  args: { phase: infoPhaseWithReport },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Report');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async ({ canvasElement }) => {
    // "Add questions" in Arabic.
    await waitForText(canvasElement, 'إضافة أسئلة');
  },
};
