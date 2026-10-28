import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { IPhaseData } from 'api/phases/types';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import {
  ideationPhase,
  infoPhase,
  waitForText,
} from '../../../../../../../.storybook/mocks/backofficeRedesign';

import usePhaseViews, { PhaseViewKey } from './usePhaseViews';
import ViewSwitch from './ViewSwitch';

// The Build, Manage and Insights switch in the header of a phase. A view the
// method has no page for is shown locked, with the reason in a tooltip.

const PhaseViewSwitch = ({
  phase,
  activeView,
}: {
  phase: IPhaseData;
  activeView: PhaseViewKey;
}) => {
  const views = usePhaseViews(phase);
  return (
    <ViewSwitch
      views={views}
      activeView={activeView}
      projectId={project1.id}
      phaseId={phase.id}
    />
  );
};

const meta = {
  title: 'Components/Redesigned/Timeline and phases/View switch',
  tags: ['bo', 'redesigned'],
  component: PhaseViewSwitch,
  args: { phase: ideationPhase, activeView: 'build' },
  play: async ({ canvasElement }) => {
    await waitForText(canvasElement, 'Insights');
  },
} satisfies Meta<typeof PhaseViewSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An ideation phase on its Build view. */
export const Default: Story = {};

/** The Manage view selected. */
export const Manage: Story = {
  args: { activeView: 'manage' },
};

/** An information phase: Manage and Insights are locked. */
export const Locked: Story = {
  args: { phase: infoPhase },
};

export const RTL: Story = {
  globals: { lang: 'ar' },
  play: async () => {},
};
