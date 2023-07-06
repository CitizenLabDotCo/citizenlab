import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import AssignSingleVotesControl from 'components/AssignSingleVoteControl';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';
import { getCurrentPhase } from 'api/phases/utils';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${media.tablet`
    padding: 20px;
    background: ${colors.background};
  `}
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
      <AssignSingleVotesControl
        ideaId={ideaId}
        projectId={projectId}
        participationContext={participationContext}
      />
    </IdeaPageContainer>
  );
});

export default AssignVoteControl;
