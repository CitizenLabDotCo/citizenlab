import React from 'react';
import styled from 'styled-components';
import Voting from './Voting';
import GoToCommentsButton from './Buttons/GoToCommentsButton';
import ShareButton from './Buttons/ShareButton';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  background-color: #e6ebec; // TODO: add color to component library
  border-radius: 2px;
  padding: 25px 15px;
`;

const StyledVoting = styled(Voting)`
  margin-bottom: 30px;
`;

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  ideaId: string;
  projectId: string;
}

const CTABox = ({ ideaId, projectId }: Props) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled = idea.attributes.action_descriptor.commenting.enabled;

    return (
      <Container>
        // TODO: a11y title
        <StyledVoting ideaId={ideaId} projectId={projectId} />
        {commentingEnabled && <StyledGoToCommentsButton />}
        <ShareButton />
      </Container>
    );
  }

  return null;
}

export default CTABox;
