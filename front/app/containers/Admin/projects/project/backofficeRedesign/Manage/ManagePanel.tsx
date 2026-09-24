import React from 'react';

import {
  Box,
  Button,
  colors,
  fontSizes,
  Icon,
  stylingConsts,
  Text,
} from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IPhaseData } from 'api/phases/types';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import useGoToAnalysis from 'containers/Admin/projects/_shared/components/AnalysisBanner/useGoToAnalysis';
import NewIdeaButton from 'containers/Admin/projects/_shared/components/NewIdeaButton';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import ExportDropdown from './ExportDropdown';
import messages from './messages';
import StatTile from './StatTile';

const ACCEPTED_CODES = ['accepted', 'implemented'];

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  statuses: IIdeaStatusData[];
  selection: Set<string>;
  feedbackNeeded: boolean;
  onToggleFeedbackNeeded: () => void;
}

const ManagePanel = ({
  project,
  phase,
  statuses,
  selection,
  feedbackNeeded,
  onToggleFeedbackNeeded,
}: Props) => {
  const { formatMessage } = useIntl();
  const scope = { projects: [project.id], phase: phase.id };
  const { data: counts } = useIdeasFilterCounts(scope);
  const { data: awaitingCounts } = useIdeasFilterCounts({
    ...scope,
    feedback_needed: true,
  });
  const { goToAnalysis, isPending } = useGoToAnalysis(project.id, phase.id);
  const isAnalysisAllowed = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });

  if (!counts || !awaitingCounts) return null;

  const total = counts.data.attributes.total;
  const awaiting = awaitingCounts.data.attributes.total;
  const responded = total - awaiting;
  const accepted = statuses
    .filter((status) => ACCEPTED_CODES.includes(status.attributes.code))
    .reduce(
      (sum, status) =>
        sum + (counts.data.attributes.idea_status_id[status.id] ?? 0),
      0
    );
  const respondedShare = total ? Math.round((responded / total) * 100) : 0;
  const caughtUp = awaiting === 0;

  return (
    <Box display="flex" flexDirection="column" gap="16px" p="20px">
      <Box display="flex" flexDirection="column" gap="8px">
        <Box display="flex" gap="8px">
          <StatTile value={total} label={formatMessage(messages.tileIdeas)} />
          <StatTile
            value={awaiting}
            label={formatMessage(messages.tileAwaitingReply)}
            tone={awaiting > 0 ? 'warning' : 'neutral'}
            tooltip={formatMessage(messages.tileAwaitingReplyTooltip)}
            active={feedbackNeeded}
            onClick={onToggleFeedbackNeeded}
          />
        </Box>
        <Box display="flex" gap="8px">
          <StatTile
            value={responded}
            label={formatMessage(messages.tileResponded)}
            tone="success"
          />
          <StatTile
            value={accepted}
            label={formatMessage(messages.tileAccepted)}
            tooltip={formatMessage(messages.tileAcceptedTooltip)}
          />
        </Box>
      </Box>

      <Box display="flex" alignItems="center" gap="8px">
        <Box
          flexGrow={1}
          h="6px"
          borderRadius="999px"
          bgColor={colors.grey200}
          overflow="hidden"
        >
          <Box h="100%" w={`${respondedShare}%`} bgColor={colors.green500} />
        </Box>
        <Text m="0" fontSize="xs" color="textSecondary">
          {formatMessage(messages.answeredProgress, { responded, total })}
        </Text>
      </Box>

      <Box
        display="flex"
        gap="10px"
        p="12px"
        borderRadius={stylingConsts.borderRadius}
        bgColor={caughtUp ? colors.green100 : colors.orange100}
      >
        <Box flexShrink={0}>
          <Icon
            name={caughtUp ? 'check-circle' : 'clock'}
            fill={caughtUp ? colors.green700 : colors.orange500}
            width="18px"
            height="18px"
          />
        </Box>
        <Box>
          <Text
            m="0"
            fontSize="s"
            fontWeight="semi-bold"
            color={caughtUp ? 'green700' : 'orange500'}
          >
            {caughtUp
              ? formatMessage(messages.caughtUpTitle)
              : formatMessage(messages.awaitingBannerTitle, {
                  count: awaiting,
                })}
          </Text>
          <Text m="0" mt="2px" fontSize="xs" color="textSecondary">
            {formatMessage(
              caughtUp ? messages.caughtUpBody : messages.awaitingBannerBody
            )}
          </Text>
        </Box>
      </Box>

      <Box display="flex" gap="8px">
        <Box flex="1 1 0">
          <ButtonWithLink
            width="100%"
            padding="6px 10px"
            fontSize={`${fontSizes.s}px`}
            iconSize="16px"
            to="/admin/projects/$projectId/phases/$phaseId/input-importer"
            params={{ projectId: project.id, phaseId: phase.id }}
            icon="download"
            buttonStyle="secondary-outlined"
          >
            {formatMessage(messages.import)}
          </ButtonWithLink>
        </Box>
        <ExportDropdown projectId={project.id} selection={selection} />
        <Box flex="1 1 0">
          <NewIdeaButton
            buttonStyle="secondary-outlined"
            padding="6px 10px"
            fontSize={`${fontSizes.s}px`}
            iconSize="16px"
            participationMethod={phase.attributes.participation_method}
            inputTerm={phase.attributes.input_term}
            to="/projects/$slug/ideas/new"
            params={{ slug: project.attributes.slug }}
            search={{ phase_id: phase.id }}
          />
        </Box>
      </Box>

      <UpsellTooltip disabled={isAnalysisAllowed} width="100%">
        <Button
          buttonStyle="secondary-outlined"
          width="100%"
          justify="left"
          icon="stars"
          iconColor={colors.teal500}
          processing={isPending}
          disabled={!isAnalysisAllowed}
          onClick={goToAnalysis}
        >
          <Box style={{ textAlign: 'left' }}>
            <Text m="0" fontSize="s" fontWeight="semi-bold" color="textPrimary">
              {formatMessage(messages.aiSummaryTitle)}
            </Text>
            <Text m="0" fontSize="xs" color="textSecondary">
              {formatMessage(messages.aiSummaryBody)}
            </Text>
          </Box>
        </Button>
      </UpsellTooltip>
    </Box>
  );
};

export default ManagePanel;
