import React, { ReactNode } from 'react';

import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, PhasePlacementFilter } from 'api/phases/types';

import { renderHook } from 'utils/testUtils/rtl';

import {
  ParticipationPanelProvider,
  useParticipationPanel,
} from './ParticipationPanelContext';

const phase = (placement_type: IPhaseData['attributes']['placement_type']) => ({
  ...mockPhaseIdeationData,
  attributes: { ...mockPhaseIdeationData.attributes, placement_type },
});

let mockPhases: IPhaseData[] = [];

// Like the API, no filter means timeline phases only.
jest.mock(
  'api/phases/usePhases',
  () => (_projectId: string, placementType?: PhasePlacementFilter) => ({
    data: {
      data: mockPhases.filter(
        ({ attributes }) =>
          placementType === 'all' ||
          attributes.placement_type === (placementType ?? 'on_timeline')
      ),
    },
    isPlaceholderData: false,
  })
);

const wrapper = ({ children }: { children: ReactNode }) => (
  <ParticipationPanelProvider projectId="project-1">
    {children}
  </ParticipationPanelProvider>
);

const renderPanel = () =>
  renderHook(() => useParticipationPanel(), { wrapper }).result.current;

it('starts collapsed when the project has no phases', () => {
  mockPhases = [];
  expect(renderPanel().collapsed).toBe(true);
});

it('starts open when the project only has spotlight surveys', () => {
  mockPhases = [phase('standalone')];
  expect(renderPanel().collapsed).toBe(false);
});

it('starts open when the project has a timeline phase', () => {
  mockPhases = [phase('on_timeline')];
  expect(renderPanel().collapsed).toBe(false);
});
