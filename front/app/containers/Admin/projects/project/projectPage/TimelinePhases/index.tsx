import React from 'react';

import { Box, Button, Text, colors } from '@citizenlab/cl2-component-library';

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
  Connector,
  PHASE_TAB_ROUTES,
  PhaseDot,
  Row,
  formatDateRange,
  phaseStatus,
} from '../phaseRowUtils';

import EmptyState from './EmptyState';
import PhaseOptionsMenu from './PhaseOptionsMenu';
import PhaseRowWithOptions from './PhaseRowWithOptions';

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

interface Props {
  projectId: string;
  /** When given, "New phase" calls this instead of linking to the phase form. */
  onNewPhase?: () => void;
  /** Adds a menu to each phase, with the actions that apply to it. */
  withPhaseOptions?: boolean;
}

const TimelinePhases = ({
  projectId,
  onNewPhase,
  withPhaseOptions = false,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { phaseId } = useParams({ strict: false });
  const { data: phases } = usePhases(projectId);

  if (!phases) {
    return null;
  }

  const sortedPhases = [...phases.data].sort((a, b) =>
    a.attributes.start_at.localeCompare(b.attributes.start_at)
  );
  const noEndLabel = formatMessage(messages.phaseNoEndDate);

  return (
    <Box
      className="intercom-product-tour-project-timeline"
      p="12px"
      borderTop={`1px solid ${colors.grey200}`}
    >
      <Text
        m="0 0 8px 0"
        px="10px"
        fontSize="s"
        fontWeight="bold"
        color="textPrimary"
      >
        {formatMessage(messages.timeline)}
      </Text>

      {sortedPhases.length === 0 && <EmptyState />}

      <Box
        className="intercom-product-tour-project-timeline-phases"
        display="flex"
        flexDirection="column"
      >
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

          const row = (
            <Link
              to={PHASE_TAB_ROUTES[getPhaseLandingTab(phase)]}
              params={{ projectId, phaseId: phase.id }}
            >
              <Row selected={isSelected}>
                {sortedPhases.length > 1 && (
                  <Connector isFirst={index === 0} isLast={isLast} />
                )}
                <PhaseDot status={status} />
                <Box
                  flexGrow={1}
                  pb="4px"
                  pr={withPhaseOptions ? '24px' : undefined}
                >
                  <Text
                    as="span"
                    m="0"
                    fontSize="s"
                    color={status === 'past' ? 'textSecondary' : 'textPrimary'}
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

          return withPhaseOptions ? (
            <PhaseRowWithOptions
              key={phase.id}
              options={<PhaseOptionsMenu projectId={projectId} phase={phase} />}
            >
              {row}
            </PhaseRowWithOptions>
          ) : (
            <React.Fragment key={phase.id}>{row}</React.Fragment>
          );
        })}
      </Box>

      <Box
        display="flex"
        mt="4px"
        className="intercom-product-tour-project-timeline-new-phase"
      >
        {onNewPhase ? (
          <Button
            buttonStyle="text"
            size="s"
            icon="plus"
            width="auto"
            onClick={onNewPhase}
          >
            {formatMessage(messages.newParticipationMethod)}
          </Button>
        ) : (
          <ButtonWithLink
            to="/admin/projects/$projectId/phases/new"
            params={{ projectId }}
            buttonStyle="text"
            size="s"
            icon="plus"
            width="auto"
          >
            {formatMessage(messages.newPhase)}
          </ButtonWithLink>
        )}
      </Box>
    </Box>
  );
};

export default TimelinePhases;
