import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import AssignSingleVoteButton from 'components/VoteInputs/single/AssignSingleVoteButton';
import VotesCounter from 'components/VotesCounter';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from '../../../containers/IdeasShow/components/RightColumnDesktop/messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: white;
  padding: 24px;
`;

interface Props {
  ideaId: string;
  participationContext: IProjectData | IPhaseData;
}

const AssignSingleVoteBox = memo(({ ideaId, participationContext }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);

  const { data: basket } = useBasket(
    participationContext.relationships?.user_basket?.data?.id
  );
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  const totalVotes = basket?.data?.attributes?.total_votes;
  const totalVotesGreaterThanZero = totalVotes !== undefined && totalVotes > 0;

  return (
    <IdeaPageContainer>
      <AssignSingleVoteButton
        ideaId={ideaId}
        participationContext={participationContext}
        buttonStyle="primary"
      />
      {participationContext?.attributes.voting_max_total && (
        <Box
          color={colors.grey700}
          mt="8px"
          display="flex"
          width="100%"
          justifyContent="center"
        >
          <FormattedMessage {...messages.youHave} />
          <Box ml="4px">
            <VotesCounter participationContext={participationContext} />
          </Box>
        </Box>
      )}
      {!participationContext?.attributes.voting_max_total && (
        <Box
          color={colors.grey700}
          mt="8px"
          display="flex"
          width="100%"
          justifyContent="center"
        >
          {!totalVotesGreaterThanZero && (
            <Box ml="4px">{formatMessage(messages.voteForAtLeastOne)}</Box>
          )}
          {totalVotesGreaterThanZero && totalVotes > 0 && (
            <Box ml="4px">{`${formatMessage(
              messages.haveVotedFor
            )} ${totalVotes} ${formatMessage(messages.xOptions, {
              votes: totalVotes,
            })}`}</Box>
          )}
        </Box>
      )}
    </IdeaPageContainer>
  );
});

export default AssignSingleVoteBox;
