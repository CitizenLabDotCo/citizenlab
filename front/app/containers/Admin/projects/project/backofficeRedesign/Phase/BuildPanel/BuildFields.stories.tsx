import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  ideationPhase,
  waitForText,
  withAllLocales,
} from '../../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  surveyPhase,
  timelineAndPhasesHandlers,
  withPhaseRoute,
} from '../../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';

import BuildFields from './BuildFields';

// The fields of a phase's build panel, shared by a saved phase and one
// being added: dates, title, description, attachments, the survey kind and
// what the method needs.

const files = {
  attachments: [],
  isUploadingFile: false,
  attachFile: fn(),
  uploadFile: fn(),
  removeFile: fn(),
  reorderFiles: fn(),
  save: fn(async () => {}),
};

const meta = {
  title: 'Components/Redesigned/Timeline and phases/Build fields',
  tags: ['bo', 'redesigned'],
  component: BuildFields,
  parameters: { msw: timelineAndPhasesHandlers },
  args: {
    projectId: project1.id,
    phaseId: ideationPhase.id,
    participationMethod: 'ideation',
    formData: ideationPhase.attributes,
    errors: null,
    validationErrors: {},
    standalone: false,
    files,
    surveyMethodSwitch: { onSelect: fn() },
    onChange: fn(),
    onDatesChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 384, padding: 20, background: 'white' }}>
        <Story />
      </div>
    ),
    withAllLocales,
    withPhaseRoute,
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Input form');
  },
} satisfies Meta<typeof BuildFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A saved ideation phase. */
export const Default: Story = {};

/** A phase being added: no description yet, the form waits for a save. */
export const Unsaved: Story = {
  args: {
    phaseId: undefined,
    formData: { ...ideationPhase.attributes, title_multiloc: {} },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Save the phase');
  },
};

/** A native survey on the timeline: the survey kind comes first. */
export const Survey: Story = {
  args: {
    phaseId: surveyPhase.id,
    participationMethod: 'native_survey',
    formData: surveyPhase.attributes,
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Survey form');
  },
};

/** The title is missing and the dates clash. */
export const WithErrors: Story = {
  args: {
    formData: { ...ideationPhase.attributes, title_multiloc: {} },
    errors: { title_multiloc: [{ error: 'blank' }] },
    validationErrors: {
      phaseDateError: 'This phase overlaps with "Choose the places".',
    },
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'overlaps');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
