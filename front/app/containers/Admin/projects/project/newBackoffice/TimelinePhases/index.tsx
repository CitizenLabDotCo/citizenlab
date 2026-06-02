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

import { IPhaseData } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getPhaseLandingTab } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import type { LinkProps } from '@tanstack/react-router';

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

const Dot = styled.div<{ status: PhaseStatus }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex: 0 0 auto;
  margin-top: 3px;
  ${({ status }) => {
    if (status === 'present') return `background: ${colors.green500};`;
    if (status === 'past') return `background: ${colors.coolGrey500};`;
    return `background: ${colors.white}; border: 2px solid ${colors.coolGrey300};`;
  }}
`;

const Connector = styled.div`
  width: 2px;
  flex: 1 1 auto;
  min-height: 8px;
  background: ${colors.grey300};
  margin: 4px 0;
`;

const Row = styled.div<{ selected: boolean }>`
  display: flex;
  gap: 10px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  background: ${({ selected }) => (selected ? colors.grey200 : 'transparent')};
  transition: background 80ms ease-out;

  &:hover {
    background: ${({ selected }) =>
      selected ? colors.grey200 : colors.grey100};
  }
`;

const PhaseTitle = styled.span<{ past: boolean }>`
  font-size: ${fontSizes.s}px;
  color: ${({ past }) => (past ? colors.textSecondary : colors.textPrimary)};
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
  color: ${colors.coolGrey600};
  font-size: ${fontSizes.s}px;

  &:hover {
    border-color: ${colors.coolGrey500};
    color: ${colors.primary};
  }
`;

const Panel = styled(Box)`
  a,
  a:hover {
    text-decoration: none;
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

  const statusLabel = (status: PhaseStatus): string | null => {
    if (status === 'past') return formatMessage(messages.phaseStatusPast);
    if (status === 'future') {
      return formatMessage(messages.phaseStatusUpcoming);
    }
    return null;
  };

  return (
    <Panel p="12px" borderTop={`1px solid ${colors.grey200}`}>
      <Text m="0 0 8px 4px" fontSize="xs" fontWeight="bold" color="coolGrey600">
        {formatMessage(messages.timelinePhases)}
      </Text>

      <Box
        display="flex"
        flexDirection="column"
        maxHeight="40vh"
        overflowY="auto"
      >
        {sortedPhases.map((phase, index) => {
          const status = phaseStatus(phase);
          const isSelected = phase.id === phaseId;
          const isLast = index === sortedPhases.length - 1;
          const label = statusLabel(status);
          const dateText = formatDateRange(
            phase.attributes.start_at,
            phase.attributes.end_at,
            noEndLabel
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
                  <Dot status={status} />
                  {!isLast && <Connector />}
                </Box>
                <Box flexGrow={1} pb="4px">
                  <PhaseTitle past={status === 'past'}>
                    {localize(phase.attributes.title_multiloc)}
                  </PhaseTitle>
                  <Text m="2px 0 0 0" fontSize="xs" color="textSecondary">
                    {dateText}
                    {label ? ` · ${label}` : ''}
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
    </Panel>
  );
};

export default TimelinePhases;
