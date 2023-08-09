import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useVoting from 'api/baskets_ideas/useVoting';

// components
import WhiteBox from '../_shared/WhiteBox';
import AssignMultipleVotesControl from './AssignMultipleVotesInput';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../_shared/messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';

// styles
import { colors } from 'utils/styleUtils';

// utils
import { isNil } from 'utils/helperUtils';

// typings
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

interface Props {
  ideaId: string;
  participationContext: IProjectData | IPhaseData;
}

const AssignMultipleVotesBox = memo(
  ({ ideaId, participationContext }: Props) => {
    const { data: idea } = useIdeaById(ideaId);
    const { numberOfVotesCast } = useVoting();
    const localize = useLocalize();
    const { formatMessage } = useIntl();

    const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
    const {
      voting_max_total,
      voting_term_singular_multiloc,
      voting_term_plural_multiloc,
    } = participationContext.attributes;

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
        <AssignMultipleVotesControl
          ideaId={ideaId}
          participationContext={participationContext}
          onIdeaPage
        />
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
  }
);

export default AssignMultipleVotesBox;
