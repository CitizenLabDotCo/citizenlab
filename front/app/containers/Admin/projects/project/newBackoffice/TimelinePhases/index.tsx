import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { sortBy } from 'lodash-es';
import moment from 'moment';
import styled from 'styled-components';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getPhaseLandingTab } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import methodMessages from 'containers/Admin/inspirationHub/messages';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import type { LinkProps } from '@tanstack/react-router';

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
  const start = moment(startAt);

  if (!endAt) {
    return `${start.format('D MMM')} – ${noEndLabel}`;
  }

  const end = moment(endAt);
  const sameMonth = start.isSame(end, 'month') && start.isSame(end, 'year');

  return sameMonth
    ? `${start.format('D')} – ${end.format('D MMM')}`
    : `${start.format('D MMM')} – ${end.format('D MMM')}`;
};

const dotStyle = (status: PhaseStatus) => {
  if (status === 'present') return { background: colors.green500 };
  if (status === 'past') return { background: colors.coolGrey500 };
  return {
    background: colors.white,
    border: `2px solid ${colors.coolGrey300}`,
  };
};

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

const NewPhaseButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  margin-top: 4px;
  border: 1px dashed ${colors.coolGrey300};
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  color: ${colors.coolGrey600};
  font-size: ${fontSizes.s}px;

  &:hover {
    border-color: ${colors.coolGrey500};
    color: ${colors.primary};
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

  if (!phases) return null;

  const sortedPhases = sortBy(phases.data, (p) => p.attributes.start_at);
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
              to={
                `/admin/projects/${projectId}/phases/${
                  phase.id
                }/${getPhaseLandingTab(phase)}` as LinkProps['to']
              }
            >
              <Row selected={isSelected} data-cy="e2e-new-project-phase-item">
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Box
                    w="10px"
                    h="10px"
                    borderRadius="50%"
                    flex="0 0 auto"
                    mt="3px"
                    {...dotStyle(status)}
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

      <Link to={`/admin/projects/${projectId}/phases/new` as LinkProps['to']}>
        <NewPhaseButton data-cy="e2e-new-project-new-phase">
          <Icon name="plus" width="16px" height="16px" fill="currentColor" />
          {formatMessage(messages.newPhase)}
        </NewPhaseButton>
      </Link>
    </Box>
  );
};

export default TimelinePhases;
