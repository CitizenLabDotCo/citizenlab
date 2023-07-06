import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// components
import AssignSingleVoteButton from 'components/AssignSingleVoteButton';

// api
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';
import { getCurrentPhase } from 'api/phases/utils';
import VotesCounter from 'components/VotesCounter';
import { Box } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

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
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(project?.data.id);
  const participationContext = getCurrentPhase(phases?.data) || project?.data;
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

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
        <Box mt="8px" display="flex" width="100%" justifyContent="center">
          <Box ml="4px">Have voted for x options</Box>
        </Box>
      )}
    </IdeaPageContainer>
  );
});

export default AssignVoteControl;
