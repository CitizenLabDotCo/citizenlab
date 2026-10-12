import React from 'react';

import {
  Box,
  Text,
  bo,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { Locale, format, isSameMonth } from 'date-fns';
import styled from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getPhaseLandingTab } from 'api/phases/utils';

import { pastPresentOrFuture } from 'utils/dateUtils';

export type PhaseLandingTab = ReturnType<typeof getPhaseLandingTab>;

export type PhaseTabTarget =
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
  locale: Locale,
  noEndLabel?: string
): string => {
  const start = new Date(startAt);
  const dayMonth = (date: Date) => format(date, 'd MMM', { locale });

  if (!endAt) {
    return `${dayMonth(start)} – ${noEndLabel ?? ''}`;
  }

  const end = new Date(endAt);

  return isSameMonth(start, end)
    ? `${format(start, 'd', { locale })} – ${dayMonth(end)}`
    : `${dayMonth(start)} – ${dayMonth(end)}`;
};

export const formatDatePair = (
  startAt: string,
  endAt: string | null,
  pattern: string,
  locale: Locale,
  noEndLabel: string
) => {
  const day = (date: string) => format(new Date(date), pattern, { locale });

  return `${day(startAt)} – ${endAt ? day(endAt) : noEndLabel}`;
};

const STEP_DOT_COLORS: Record<PhaseStatus, string> = {
  past: colors.teal500,
  present: colors.primary,
  future: colors.grey300,
};

// The white ring stops the line behind the dot short of it.
export const StepDot = ({ status }: { status: PhaseStatus }) => (
  <Box
    position="relative"
    zIndex="1"
    flex="0 0 auto"
    w="8px"
    h="8px"
    mt="6px"
    ml="4px"
    mr="12px"
    borderRadius="50%"
    background={STEP_DOT_COLORS[status]}
    boxShadow={`0 0 0 3px ${
      status === 'present' ? bo.colors.stepHalo : colors.white
    }`}
  />
);

export const StepLine = ({ status }: { status: PhaseStatus }) => (
  <Box
    position="absolute"
    top="16px"
    bottom="-14px"
    left="15.5px"
    w="1px"
    background={status === 'past' ? colors.green300 : colors.grey200}
  />
);

const SURVEY_DOT_STYLES: Record<
  PhaseStatus,
  { background: string; border: string; boxShadow: string }
> = {
  past: { background: colors.coolGrey600, border: 'none', boxShadow: 'none' },
  present: {
    background: colors.green400,
    border: 'none',
    boxShadow: `0 0 0 3px ${bo.colors.liveHalo}`,
  },
  future: {
    background: colors.white,
    border: `1.5px solid ${bo.colors.stepBorder}`,
    boxShadow: 'none',
  },
};

export const SurveyDot = ({ status }: { status: PhaseStatus }) => {
  const { background, border, boxShadow } = SURVEY_DOT_STYLES[status];

  return (
    <Box
      flex="0 0 auto"
      w="10px"
      h="10px"
      mt="2px"
      borderRadius="50%"
      background={background}
      border={border}
      boxShadow={boxShadow}
    />
  );
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

export const ExampleRow = ({
  withConnector = false,
  isFirst = false,
  isLast = false,
  children,
}: {
  withConnector?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  children: React.ReactNode;
}) => (
  <Box position="relative" display="flex" gap="10px" p="8px">
    {withConnector && <Connector isFirst={isFirst} isLast={isLast} />}
    <Box w="10px" flex="0 0 auto">
      <Box
        position="relative"
        zIndex="1"
        w="10px"
        h="10px"
        borderRadius="50%"
        mt="3px"
        background={colors.coolGrey300}
      />
    </Box>
    <Text m="0" fontSize="s" color="textSecondary">
      {children}
    </Text>
  </Box>
);

const DOT_CENTER = 16;

export const Connector = styled.div<{ isFirst: boolean; isLast: boolean }>`
  position: absolute;
  left: 13px; /* 8px row padding + 5px (half the 10px dot) */
  width: 2px;
  margin-left: -1px;
  top: ${({ isFirst }) => (isFirst ? `${DOT_CENTER}px` : '0')};
  bottom: ${({ isLast }) => (isLast ? 'auto' : '0')};
  height: ${({ isLast }) => (isLast ? `${DOT_CENTER}px` : 'auto')};
  background: ${colors.coolGrey300};
`;

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

// Text has no line-height prop, so these set it themselves.
export const StepRow = styled(Row)`
  gap: 0;
  border-radius: ${bo.borderRadius};
`;

export const StepTitle = styled(Text)`
  margin: 0;
  font-size: ${fontSizes.xs}px;
  font-weight: 500;
  line-height: 1.3;
`;

export const StepMeta = styled(Text)`
  margin: 2px 0 0 0;
  font-size: ${fontSizes.xxs}px;
  line-height: 14px;

  & > span {
    font-size: inherit;
    line-height: inherit;
  }
`;

export const SurveyRow = styled(Row)`
  gap: 11px;
  padding: 9px 12px;
  border-radius: ${bo.borderRadius};
`;

export const SurveyTitle = styled(Text)`
  display: block;
  margin: 0;
  font-size: ${fontSizes.s}px;
  line-height: 1.3;
`;

export const SurveyMeta = styled(Text)`
  margin: 2px 0 0 0;
  font-size: ${fontSizes.xs}px;
  line-height: 1.3;

  & > span {
    line-height: inherit;
  }
`;
