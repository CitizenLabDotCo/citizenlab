import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useBasket from 'api/baskets/useBasket';
import { getCurrentPhase } from 'api/phases/utils';

// styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// components
import AssignSingleVoteButton from 'components/AssignSingleVoteButton';
import VotesCounter from 'components/VotesCounter';
import { Box } from '@citizenlab/cl2-component-library';

// intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// api
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';
import { isNilOrError } from 'utils/helperUtils';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: white;
  padding: 24px;
`;

interface Props {
  projectId: string;
  ideaId: string;
}

const AssignVoteControl = memo(({ ideaId, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(project?.data.id);
  const participationContext = getCurrentPhase(phases?.data) || project?.data;
  const { data: basket } = useBasket(
    participationContext?.relationships?.user_basket?.data?.id
  );
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  const totalVotes = basket?.data?.attributes?.total_votes;
  const totalVotesGreaterThanZero = !isNilOrError(totalVotes) && totalVotes > 0; // Need to use isNilOrError here, as otherwise the numbers can result in strange boolean values

  return (
    <IdeaPageContainer>
      <AssignSingleVoteButton
        ideaId={ideaId}
        projectId={projectId}
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
            {project?.data.id && <VotesCounter projectId={project?.data.id} />}
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

export default AssignVoteControl;
