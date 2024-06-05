import React, { memo } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useVoting from 'api/baskets_ideas/useVoting';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNil } from 'utils/helperUtils';

import messages from '../_shared/messages';
import WhiteBox from '../_shared/WhiteBox';

import AssignMultipleVotesControl from './AssignMultipleVotesInput';

interface Props {
  ideaId: string;
  phase: IPhaseData;
}

const AssignMultipleVotesBox = memo(({ ideaId, phase }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const { numberOfVotesCast } = useVoting();
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const actionDescriptor = idea?.data.attributes.action_descriptors.voting;
  const {
    voting_max_total,
    voting_term_singular_multiloc,
    voting_term_plural_multiloc,
  } = phase.attributes;

  if (!actionDescriptor || isNil(voting_max_total)) {
    return null;
  }

  const votesLeft = voting_max_total - (numberOfVotesCast ?? 0);
  const voteTerm = voting_term_singular_multiloc
    ? localize(voting_term_singular_multiloc)
    : formatMessage(messages.vote);
  const votesTerm = voting_term_plural_multiloc
    ? localize(voting_term_plural_multiloc)
    : formatMessage(messages.votes);

  return (
    <WhiteBox>
      <AssignMultipleVotesControl ideaId={ideaId} phase={phase} onIdeaPage />
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
            voteTerm,
            votesTerm,
          }}
        />
      </Box>
    </WhiteBox>
  );
});

export default AssignMultipleVotesBox;
