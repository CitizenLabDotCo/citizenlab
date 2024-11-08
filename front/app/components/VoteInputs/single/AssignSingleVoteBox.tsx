import React, { memo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../_shared/messages';
import WhiteBox from '../_shared/WhiteBox';

import ownMessages from './messages';

interface Props {
  ideaId: string;
  phase: IPhaseData;
}

const AssignSingleVoteBox = memo(({ ideaId, phase }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);
  const { numberOfVotesCast } = useVoting();

  const { data: basket } = useBasket(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    phase.relationships?.user_basket?.data?.id
  );
  const actionDescriptor = idea?.data.attributes.action_descriptors.voting;
  const { voting_max_total } = phase.attributes;

  if (!actionDescriptor) return null;

  const votesLeft = (voting_max_total ?? 0) - (numberOfVotesCast ?? 0);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const totalVotes = basket?.data?.attributes?.total_votes;
  const totalVotesGreaterThanZero = totalVotes !== undefined && totalVotes > 0;

  return (
    <WhiteBox>
      <AssignSingleVoteButton
        ideaId={ideaId}
        phase={phase}
        buttonStyle="primary"
      />
      {voting_max_total && (
        <Box
          color={colors.grey700}
          mt="8px"
          display="flex"
          width="100%"
          justifyContent="center"
        >
          <FormattedMessage
            {...messages.votesLeft}
            values={{
              votesLeft: votesLeft.toLocaleString(),
              totalNumberOfVotes: voting_max_total.toLocaleString(),
              voteTerm: formatMessage(messages.vote),
              votesTerm: formatMessage(messages.votes),
            }}
          />
        </Box>
      )}
      {!voting_max_total && (
        <Box
          color={colors.grey700}
          mt="8px"
          display="flex"
          width="100%"
          justifyContent="center"
        >
          {!totalVotesGreaterThanZero && (
            <Box ml="4px">{formatMessage(ownMessages.voteForAtLeastOne)}</Box>
          )}
          {totalVotesGreaterThanZero && (
            <Box ml="4px">
              {formatMessage(ownMessages.youHaveVotedForX, {
                votes: totalVotes,
              })}
            </Box>
          )}
        </Box>
      )}
    </WhiteBox>
  );
});

export default AssignSingleVoteBox;
