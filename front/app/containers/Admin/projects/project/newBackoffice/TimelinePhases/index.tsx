import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { format, isSameMonth } from 'date-fns';
import styled from 'styled-components';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getPhaseLandingTab } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import methodMessages from 'containers/Admin/inspirationHub/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

// Each phase landing tab maps to a registered phase route literal, so the
// Link `to` below is compile-checked against the route tree instead of being
// an interpolated string cast with `as LinkProps['to']`.
type PhaseLandingTab = ReturnType<typeof getPhaseLandingTab>;

type PhaseTabTarget =
  | '/admin/projects/$projectId/phases/$phaseId/setup'
  | '/admin/projects/$projectId/phases/$phaseId/ideas'
  | '/admin/projects/$projectId/phases/$phaseId/proposals'
  | '/admin/projects/$projectId/phases/$phaseId/insights'
  | '/admin/projects/$projectId/phases/$phaseId/polls'
  | '/admin/projects/$projectId/phases/$phaseId/survey-results'
  | '/admin/projects/$projectId/phases/$phaseId/volunteering';

const PHASE_TAB_ROUTES: Record<PhaseLandingTab, PhaseTabTarget> = {
  setup: '/admin/projects/$projectId/phases/$phaseId/setup',
  ideas: '/admin/projects/$projectId/phases/$phaseId/ideas',
  proposals: '/admin/projects/$projectId/phases/$phaseId/proposals',
  insights: '/admin/projects/$projectId/phases/$phaseId/insights',
  polls: '/admin/projects/$projectId/phases/$phaseId/polls',
  'survey-results': '/admin/projects/$projectId/phases/$phaseId/survey-results',
  volunteering: '/admin/projects/$projectId/phases/$phaseId/volunteering',
};

const METHOD_LABELS: Record<ParticipationMethod, MessageDescriptor> = {
  ideation: methodMessages.ideation,
  proposals: methodMessages.proposals,
  native_survey: methodMessages.survey,
  community_monitor_survey: methodMessages.communityMonitorSurvey,
  survey: methodMessages.externalSurvey,
  information: methodMessages.information,
  voting: methodMessages.voting,
  poll: methodMessages.poll,
  volunteering: methodMessages.volunteering,
  common_ground: methodMessages.commonGround,
  document_annotation: methodMessages.documentAnnotation,
};

type PhaseStatus = 'past' | 'present' | 'future';

const phaseStatus = (phase: IPhaseData): PhaseStatus =>
  pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]);

const formatDateRange = (
  startAt: string,
  endAt: string | null,
  noEndLabel: string
): string => {
  const start = new Date(startAt);

  if (!endAt) {
    return `${format(start, 'd MMM')} – ${noEndLabel}`;
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

// Future phases show as an outline ring; present/past are filled.
const dotBorder = (status: PhaseStatus) =>
  status === 'future' ? `2px solid ${colors.coolGrey300}` : undefined;

const Row = styled.div<{ selected: boolean }>`
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

interface Props {
  projectId: string;
}

const TimelinePhases = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false }) as { phaseId?: string };
  const { data: phases } = usePhases(projectId);

  if (!phases) {
    return null;
  }

  const sortedPhases = [...phases.data].sort((a, b) =>
    a.attributes.start_at.localeCompare(b.attributes.start_at)
  );
  const noEndLabel = formatMessage(messages.phaseNoEndDate);

  return (
    <Box p="12px" borderTop={`1px solid ${colors.grey200}`}>
      <Text
        m="0 0 8px 0"
        px="2px"
        fontSize="m"
        fontWeight="bold"
        color="textPrimary"
      >
        {formatMessage(messages.timeline)}
      </Text>

      <Box display="flex" flexDirection="column">
        {sortedPhases.map((phase, index) => {
          const status = phaseStatus(phase);
          const isSelected = phase.id === phaseId;
          const isLast = index === sortedPhases.length - 1;
          const dateText = formatDateRange(
            phase.attributes.start_at,
            phase.attributes.end_at,
            noEndLabel
          );
          const methodLabel = formatMessage(
            METHOD_LABELS[phase.attributes.participation_method]
          );

          return (
            <Link
              key={phase.id}
              to={PHASE_TAB_ROUTES[getPhaseLandingTab(phase)]}
              params={{ projectId, phaseId: phase.id }}
            >
              <Row selected={isSelected}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="50%"
                    flex="0 0 auto"
                    mt="3px"
                    background={dotBackground(status)}
                    border={dotBorder(status)}
                  />
                  {!isLast && (
                    <Box
                      w="2px"
                      flex="1 1 auto"
                      minHeight="8px"
                      background={colors.grey300}
                      my="4px"
                    />
                  )}
                </Box>
                <Box flexGrow={1} pb="4px">
                  <Text
                    as="span"
                    m="0"
                    fontSize="s"
                    color={status === 'past' ? 'textSecondary' : 'textPrimary'}
                    style={
                      status === 'past'
                        ? { textDecoration: 'line-through' }
                        : undefined
                    }
                  >
                    {localize(phase.attributes.title_multiloc)}
                  </Text>
                  <Text m="2px 0 0 0" fontSize="xs" color="textSecondary">
                    {dateText} · {methodLabel}
                  </Text>
                </Box>
              </Row>
            </Link>
          );
        })}
      </Box>

      <Box display="flex" mt="4px">
        <ButtonWithLink
          linkTo={`/admin/projects/${projectId}/phases/new`}
          buttonStyle="primary-inverse"
          icon="plus"
          py="4px"
        >
          {formatMessage(messages.newPhase)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default TimelinePhases;
