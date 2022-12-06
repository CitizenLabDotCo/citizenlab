import React from 'react';
import useIdea from 'hooks/useIdea';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import GoToCommentsButton from '../../Buttons/GoToCommentsButton';

const Container = styled.div``;

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  ideaId: string;
  border?: string;
  className?: string;
}

const IdeaCTAButtons = ({ ideaId, className }: Props) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting_idea.enabled;

    return (
      <Container className={className || ''}>
        {commentingEnabled && <StyledGoToCommentsButton />}
      </Container>
    );
  }

  return null;
};

export default IdeaCTAButtons;
