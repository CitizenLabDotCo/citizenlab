import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';
import { format, isSameMonth } from 'date-fns';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getPhaseLandingTab } from 'api/phases/utils';

import { pastPresentOrFuture } from 'utils/dateUtils';

type PhaseLandingTab = ReturnType<typeof getPhaseLandingTab>;

type PhaseTabTarget =
  | '/admin/projects/$projectId/phases/$phaseId/setup'
  | '/admin/projects/$projectId/phases/$phaseId/ideas'
  | '/admin/projects/$projectId/phases/$phaseId/proposals'
  | '/admin/projects/$projectId/phases/$phaseId/insights'
  | '/admin/projects/$projectId/phases/$phaseId/polls'
  | '/admin/projects/$projectId/phases/$phaseId/survey-results'
  | '/admin/projects/$projectId/phases/$phaseId/volunteering';

export const PHASE_TAB_ROUTES: Record<PhaseLandingTab, PhaseTabTarget> = {
  setup: '/admin/projects/$projectId/phases/$phaseId/setup',
  ideas: '/admin/projects/$projectId/phases/$phaseId/ideas',
  proposals: '/admin/projects/$projectId/phases/$phaseId/proposals',
  insights: '/admin/projects/$projectId/phases/$phaseId/insights',
  polls: '/admin/projects/$projectId/phases/$phaseId/polls',
  'survey-results': '/admin/projects/$projectId/phases/$phaseId/survey-results',
  volunteering: '/admin/projects/$projectId/phases/$phaseId/volunteering',
};

export type PhaseStatus = 'past' | 'present' | 'future';

export const phaseStatus = (phase: IPhaseData): PhaseStatus =>
  pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]);

export const formatDateRange = (
  startAt: string,
  endAt: string | null,
  noEndLabel?: string
): string => {
  const start = new Date(startAt);

  if (!endAt) {
    return `${format(start, 'd MMM')} – ${noEndLabel ?? ''}`;
  }

  const end = new Date(endAt);

  return isSameMonth(start, end)
    ? `${format(start, 'd')} – ${format(end, 'd MMM')}`
    : `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
};

const dotBackground = (status: PhaseStatus) => {
  if (status === 'present') return colors.green500;
  if (status === 'past') return colors.coolGrey500;
  return colors.white;
};

const dotBorder = (status: PhaseStatus) =>
  status === 'future' ? `2px solid ${colors.coolGrey300}` : undefined;

export const PhaseDot = ({ status }: { status: PhaseStatus }) => (
  <Box w="10px" flex="0 0 auto">
    <Box
      position="relative"
      zIndex="1"
      w="10px"
      h="10px"
      borderRadius="50%"
      mt="3px"
      background={dotBackground(status)}
      border={dotBorder(status)}
    />
  </Box>
);

export const Row = styled.div<{ selected: boolean }>`
  position: relative;
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  background: ${({ selected }) => (selected ? colors.grey200 : 'transparent')};
  transition: background 80ms ease-out;

  &:hover {
    background: ${({ selected }) =>
      selected ? colors.grey200 : colors.grey100};
  }
`;
