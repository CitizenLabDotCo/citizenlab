import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import useVoting from 'api/baskets_ideas/useVoting';

// styles
import { colors } from 'utils/styleUtils';

// components
import WhiteBox from '../_shared/WhiteBox';
import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from '../_shared/messages';
import ownMessages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface Props {
  ideaId: string;
  participationContext: IProjectData | IPhaseData;
}

const AssignSingleVoteBox = memo(({ ideaId, participationContext }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);
  const { numberOfVotesCast } = useVoting();

  const { data: basket } = useBasket(
    participationContext.relationships?.user_basket?.data?.id
  );
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const { voting_max_total } = participationContext.attributes;

  if (!actionDescriptor) return null;

  const votesLeft = (voting_max_total ?? 0) - (numberOfVotesCast ?? 0);

  const totalVotes = basket?.data?.attributes?.total_votes;
  const totalVotesGreaterThanZero = totalVotes !== undefined && totalVotes > 0;

  return (
    <WhiteBox>
      <AssignSingleVoteButton
        ideaId={ideaId}
        participationContext={participationContext}
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
