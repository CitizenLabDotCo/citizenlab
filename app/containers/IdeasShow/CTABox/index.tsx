import React from 'react';
import styled from 'styled-components';
import Voting from './Voting';
import GoToCommentsButton from './Buttons/GoToCommentsButton';
// import ShareButton from './Buttons/ShareButton';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  background-color: #edeff0; // TODO: add color to component library
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
  className?: string;
  ideaId: string;
  projectId: string;
}

const CTABox = ({ className, ideaId, projectId }: Props) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting.enabled;

    // TODO: a11y title
    return (
      <Container className={className}>
        <StyledVoting ideaId={ideaId} projectId={projectId} />
        {commentingEnabled && <StyledGoToCommentsButton />}
        {/* <ShareButton /> */}
      </Container>
    );
  }

  return null;
};

export default CTABox;
