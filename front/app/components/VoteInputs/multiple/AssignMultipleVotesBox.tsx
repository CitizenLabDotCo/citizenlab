import React, { memo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';
import { getPhaseVoteTermMessage } from 'api/phases/utils';

import { FormattedMessage } from 'utils/cl-intl';
import { isNil } from 'utils/helperUtils';

import messages from '../_shared/messages';
import WhiteBox from '../_shared/WhiteBox';

import AssignMultipleVotesInput from './AssignMultipleVotesInput';

interface Props {
  ideaId: string;
  phase: IPhaseData;
}

const AssignMultipleVotesBox = memo(({ ideaId, phase }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const { numberOfVotesCast } = useVoting();

  const actionDescriptor = idea?.data.attributes.action_descriptors.voting;
  const { voting_max_total } = phase.attributes;

  if (!actionDescriptor || isNil(voting_max_total)) {
    return null;
  }

  const votesLeft = voting_max_total - (numberOfVotesCast ?? 0);
  const votesLeftMessage = getPhaseVoteTermMessage(phase, {
    vote: messages.numberOfVotesLeft,
    point: messages.numberOfPointsLeft,
    token: messages.numberOfTokensLeft,
    credit: messages.numberOfCreditsLeft,
    percent: messages.numberOfPercentsLeft,
  });

  return (
    <WhiteBox>
      <AssignMultipleVotesInput ideaId={ideaId} phase={phase} onIdeaPage />
      <Box
        color={colors.grey700}
        mt="8px"
        display="flex"
        width="100%"
        justifyContent="center"
      >
        <FormattedMessage
          {...votesLeftMessage}
          values={{
            votesLeft: votesLeft.toLocaleString(),
            totalNumberOfVotes: voting_max_total.toLocaleString(),
          }}
        />
      </Box>
    </WhiteBox>
  );
});

export default AssignMultipleVotesBox;
