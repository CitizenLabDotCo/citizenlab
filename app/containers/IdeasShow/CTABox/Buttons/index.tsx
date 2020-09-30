import React from 'react';
import styled from 'styled-components';
import GoToCommentsButton from '../../Buttons/GoToCommentsButton';
import IdeaSharingButton from '../../Buttons/IdeaSharingButton';
import SharingButtonComponent from '../../Buttons/SharingButtonComponent';
import { isNilOrError } from 'utils/helperUtils';
import useIdea from 'hooks/useIdea';

const StyledGoToCommentsButton = styled(GoToCommentsButton)`
  margin-bottom: 10px;
`;

interface Props {
  ideaId: string;
  border?: string;
}

const IdeaCTAButtons = ({ ideaId }: Props) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const commentingEnabled =
      idea.attributes.action_descriptor.commenting_idea.enabled;

    return (
      <>
        {commentingEnabled && <StyledGoToCommentsButton />}
        <IdeaSharingButton
          ideaId={ideaId}
          buttonComponent={<SharingButtonComponent />}
        />
      </>
    );
  }

  return null;
};

export default IdeaCTAButtons;
