import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';

// styles
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import AssignMultipleVotesControl from 'components/AssignMultipleVotesControl';

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

const AssignVotesControl = memo(({ ideaId, projectId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const actionDescriptor = idea?.data.attributes.action_descriptor.voting;
  if (!actionDescriptor) return null;

  return (
    <IdeaPageContainer>
      <AssignMultipleVotesControl ideaId={ideaId} />
    </IdeaPageContainer>
  );
});

export default AssignVotesControl;
