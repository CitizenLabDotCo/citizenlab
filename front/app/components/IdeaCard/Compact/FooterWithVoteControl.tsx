import React from 'react';
import useProject from 'hooks/useProject';
import { isNilOrError } from 'utils/helperUtils';

// components
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
import { IIdeaData } from 'services/ideas';
import CommentCount from './CommentCount';

// styles
import styled from 'styled-components';

const Container = styled.footer`
  display: flex;
  align-items: center;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const StyledStatusBadge = styled(StatusBadge)`
  display: block;
  margin-left: 25px;
`;

const StyledVoteControl = styled(VoteControl)`
  margin-right: 30px;
`;

interface Props {
  idea: IIdeaData;
  hideIdeaStatus?: boolean;
  className?: string;
}

const FooterWithVoteControl = ({ idea, hideIdeaStatus, className }: Props) => {
  const ideaStatusId = idea.relationships.idea_status.data.id;
  const project = useProject({ projectId: idea.relationships.project.data.id });

  if (!isNilOrError(project)) {
    const commentingEnabled = project.attributes.commenting_enabled;
    const projectHasComments = project.attributes.comments_count > 0;
    const showCommentCount = commentingEnabled || projectHasComments;

    return (
      <Container className={className || ''}>
        <Left>
          <StyledVoteControl
            styleType="border"
            ideaId={idea.id}
            size="1"
            ariaHidden
          />

          {showCommentCount && (
            <CommentCount commentCount={idea.attributes.comments_count} />
          )}
        </Left>
        {!hideIdeaStatus && (
          <Right>
            <StyledStatusBadge statusId={ideaStatusId} />
          </Right>
        )}
      </Container>
    );
  }

  return null;
};

export default FooterWithVoteControl;
