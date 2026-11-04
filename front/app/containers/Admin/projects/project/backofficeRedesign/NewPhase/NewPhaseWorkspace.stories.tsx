import React from 'react';

import { Meta, StoryObj } from '@storybook/react';
import { fn } from 'storybook/test';

import { project1 } from 'api/projects/__mocks__/_mockServer';

import useNewPhaseDefaults from 'containers/Admin/projects/project/phaseSetup/useNewPhaseDefaults';

import {
  waitForText,
  withAllLocales,
  withDesktopWidth,
  withPreviewPlaceholder,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';
import {
  phaseRoute,
  timelineAndPhasesHandlers,
} from '../../../../../../../.storybook/mocks/backofficeRedesignTimelineAndPhases';
import { PageSaveProvider } from '../_shared/PageSaveContext';

import NewPhaseWorkspace from './NewPhaseWorkspace';

// The workspace of a phase being added, before it is saved: the phone
// preview, the method settings and the build fields in the side panel.

type Props = React.ComponentProps<typeof NewPhaseWorkspace>;

// The new phase starts from the platform's defaults for the method, as on
// the page.
const WithDefaults = (props: Props) => {
  const newPhaseDefaults = useNewPhaseDefaults();
  if (!newPhaseDefaults) return null;
  return (
    <NewPhaseWorkspace
      {...props}
      initialFormData={newPhaseDefaults(
        props.participationMethod,
        props.standalone
      )}
      defaultsForMethod={newPhaseDefaults}
    />
  );
};

const meta = {
  title: 'Components/Redesigned/Timeline and phases/New phase workspace',
  tags: ['bo', 'redesigned'],
  component: NewPhaseWorkspace,
  parameters: { layout: 'fullscreen', msw: timelineAndPhasesHandlers },
  args: {
    project: project1,
    participationMethod: 'ideation',
    label: 'New phase',
    standalone: false,
    initialFormData: {},
    defaultsForMethod: fn(() => ({})),
  },
  render: (args) => <WithDefaults {...args} />,
  decorators: [
    (Story) => (
      <PageSaveProvider>
        <div style={{ minHeight: 900 }}>
          <Story />
        </div>
      </PageSaveProvider>
    ),
    withAllLocales,
    phaseRoute(),
    withPreviewPlaceholder,
    withDesktopWidth,
  ],
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'New phase');
  },
} satisfies Meta<typeof NewPhaseWorkspace>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A new ideation phase. */
export const Default: Story = {};

/** A new voting phase. */
export const Voting: Story = {
  args: { participationMethod: 'voting' },
};

/** A new survey outside the timeline: its dates may overlap. */
export const StandaloneSurvey: Story = {
  args: {
    participationMethod: 'native_survey',
    standalone: true,
    label: 'New survey',
  },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'New survey');
  },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
