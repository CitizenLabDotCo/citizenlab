import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { userEvent, waitFor, within } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  ideationPhase,
  votingPhase,
  waitForText,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  postingPermissionHandler,
  surveyPhase,
  timelineAndPhasesHandlers,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import FormSection from './FormSection';

// The form part of the phase build panel for methods that collect
// submissions: add questions to the input or survey form, add ideas from an
// earlier phase (voting), and import inputs collected offline.

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Form section',
  tags: ['bo', 'redesigned'],
  component: FormSection,
  parameters: { msw: timelineAndPhasesHandlers },
  args: {
    projectId: project1.id,
    participationMethod: 'ideation',
    phaseId: ideationPhase.id,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Input form');
  },
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase: the input form. */
export const Default: Story = {};

/** A native survey: the survey form. */
export const Survey: Story = {
  args: { participationMethod: 'native_survey', phaseId: surveyPhase.id },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Survey form');
  },
};

/** A voting phase: ideas can also come from an earlier phase. */
export const Voting: Story = {
  args: { participationMethod: 'voting', phaseId: votingPhase.id },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Add ideas from previous phase');
  },
};

/** Not saved yet: the buttons wait for the phase to exist. */
export const Disabled: Story = {
  args: { phaseId: undefined },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Save the phase');
  },
};

/** The offline collection modal, open. */
export const OfflineCollectionOpen: Story = {
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Offline collection');
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: /Offline collection/ })
    );
    await waitForText(document.body, 'Import');
  },
};

/** The questions modal, open: participants are asked for information first. */
export const AddQuestionsOpen: Story = {
  parameters: {
    msw: [postingPermissionHandler, ...timelineAndPhasesHandlers],
  },
  play: async ({ canvasElement }) => {
    // The button stays disabled until the phase permissions load.
    const button = await within(canvasElement).findByRole('button', {
      name: 'Add questions',
    });
    await waitFor(
      () => {
        if (button.getAttribute('aria-disabled') !== 'false') {
          throw new Error('still disabled');
        }
      },
      { timeout: 10000 }
    );
    await userEvent.click(button);
    await waitForText(document.body, 'Information collected');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
