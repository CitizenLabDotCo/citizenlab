import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import OfflineVoteSettings from 'components/admin/PostManager/components/PostPreview/Idea/Components/OfflineVoteSettings';
import previewMessages from 'components/admin/PostManager/components/PostPreview/messages';
import postManagerMessages from 'components/admin/PostManager/messages';

import Icon from 'design-system/Icon';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';

import TooltipMark from '../TooltipMark';

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
          <span className={styles.budget}>
            <FormattedBudget value={budget} />
          </span>
          <span className={styles.secondary}>
            <FormattedMessage
              {...previewMessages.picks}
              values={{ picksNumber: baskets_count }}
            />
          </span>
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
