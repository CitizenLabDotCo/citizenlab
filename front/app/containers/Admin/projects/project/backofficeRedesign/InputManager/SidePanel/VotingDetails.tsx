import React from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import { IPhaseData } from 'api/phases/types';

import OfflineVoteSettings from 'components/admin/PostManager/components/PostPreview/Idea/Components/OfflineVoteSettings';
import previewMessages from 'components/admin/PostManager/components/PostPreview/messages';
import postManagerMessages from 'components/admin/PostManager/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import FormattedBudget from 'utils/currency/FormattedBudget';

import PropertyRow from './PropertyRow';

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
    <Box display="flex" flexDirection="column" gap="8px">
      {budget && (
        <PropertyRow label={formatMessage(postManagerMessages.cost)}>
          <Text variant="boSection" fontWeight="bold" m="0">
            <FormattedBudget value={budget} />
          </Text>
          <Text variant="boHelper" m="0">
            <FormattedMessage
              {...previewMessages.picks}
              values={{ picksNumber: baskets_count }}
            />
          </Text>
          <IconTooltip
            content={
              <FormattedMessage {...postManagerMessages.pbItemCountTooltip} />
            }
          />
        </PropertyRow>
      )}
      {phase && votingMethod && (
        <OfflineVoteSettings
          ideaId={idea.id}
          phaseId={phase.id}
          votingMethod={votingMethod}
        />
      )}
    </Box>
  );
};

export default VotingDetails;
