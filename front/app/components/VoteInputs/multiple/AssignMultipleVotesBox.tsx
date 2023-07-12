import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// components
import AssignMultipleVotesControl from './AssignMultipleVotesInput';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// utils
import { getCurrentParticipationContext } from 'api/phases/utils';

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

const AssignMultipleVotesBox = memo(({ ideaId, projectId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  const participationContext = getCurrentParticipationContext(
    project?.data,
    phases?.data
  );

  if (!actionDescriptor || !participationContext) {
    return null;
  }

  return (
    <IdeaPageContainer>
      <AssignMultipleVotesControl
        ideaId={ideaId}
        participationContext={participationContext}
      />
    </IdeaPageContainer>
  );
});

export default AssignMultipleVotesBox;
