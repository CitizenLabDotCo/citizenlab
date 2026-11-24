import React from 'react';

import Icon from 'design-system/Icon';
import Text from 'design-system/Text';
import TooltipMark from 'design-system/Tooltip/TooltipMark';

import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import OfflineVoteSettings from 'components/admin/PostManager/components/PostPreview/Idea/Components/OfflineVoteSettings';
import previewMessages from 'components/admin/PostManager/components/PostPreview/messages';
import postManagerMessages from 'components/admin/PostManager/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';

import PropertyRow from './PropertyRow';
import styles from './SidePanel.module.css';

interface Props {
  idea: IIdeaData;
  phase: IPhaseData | undefined;
}

const VotingDetails = ({ idea, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { budget, baskets_count } = idea.attributes;
  const votingMethod = phase?.attributes.voting_method;

  if (!budget && !votingMethod) return null;

  return (
    <div className={styles.properties}>
      {budget && (
        <PropertyRow label={formatMessage(postManagerMessages.cost)}>
          <Text as="span" variant="uiStrong" tone="primary">
            <FormattedBudget value={budget} />
          </Text>
          <Text as="span" variant="ui" tone="secondary">
            <FormattedMessage
              {...previewMessages.picks}
              values={{ picksNumber: baskets_count }}
            />
          </Text>
          <TooltipMark
            label={formatMessage(postManagerMessages.pbItemCountTooltip)}
          >
            <Icon name="info-16" className={styles.infoIcon} />
          </TooltipMark>
        </PropertyRow>
      )}
      {phase && votingMethod && (
        <OfflineVoteSettings
          ideaId={idea.id}
          phaseId={phase.id}
          votingMethod={votingMethod}
          variant="panel"
        />
      )}
    </div>
  );
};

export default VotingDetails;
