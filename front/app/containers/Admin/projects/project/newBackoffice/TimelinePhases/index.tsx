import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import { getPhaseLandingTab } from 'api/phases/utils';

import useLocalize from 'hooks/useLocalize';

import methodMessages from 'containers/Admin/inspirationHub/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { useParams } from 'utils/router';

import messages from '../messages';
import {
  PHASE_TAB_ROUTES,
  Row,
  dotBackground,
  dotBorder,
  formatDateRange,
  phaseStatus,
} from '../phaseRowUtils';

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

const DOT_CENTER = 16;

const Connector = styled.div<{ isFirst: boolean; isLast: boolean }>`
  position: absolute;
  left: 13px; /* 8px row padding + 5px (half the 10px dot) */
  width: 2px;
  margin-left: -1px;
  top: ${({ isFirst }) => (isFirst ? `${DOT_CENTER}px` : '0')};
  bottom: ${({ isLast }) => (isLast ? 'auto' : '0')};
  height: ${({ isLast }) => (isLast ? `${DOT_CENTER}px` : 'auto')};
  background: ${colors.coolGrey300};
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
        px="10px"
        fontSize="s"
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
                {sortedPhases.length > 1 && (
                  <Connector isFirst={index === 0} isLast={isLast} />
                )}
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
          buttonStyle="text"
          size="s"
          icon="plus"
          width="auto"
        >
          {formatMessage(messages.newPhase)}
        </ButtonWithLink>
      </Box>
    </Box>
  );
};

export default TimelinePhases;
