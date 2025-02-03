import React from 'react';

import styled from 'styled-components';

import { IIdeaData } from 'api/ideas/types';

import ReactionControl from 'components/ReactionControl';
import { showIdeationReactions } from 'components/ReactionControl/utils';
import StatusBadge from 'components/StatusBadge';

import CommentCount from './CommentCount';

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

const StyledReactionControl = styled(ReactionControl)`
  margin-right: 4px;
`;

interface Props {
  idea: IIdeaData;
  hideIdeaStatus?: boolean;
  className?: string;
  showCommentCount: boolean;
}

const IdeationFooter = ({
  idea,
  hideIdeaStatus,
  className,
  showCommentCount,
}: Props) => {
  const ideaStatusId = idea.relationships.idea_status.data?.id;
  const showReactionControl = showIdeationReactions(idea);

  return (
    <Container className={className || ''}>
      <Left>
        {showReactionControl && (
          <StyledReactionControl styleType="border" ideaId={idea.id} size="1" />
        )}

        {showCommentCount && (
          <CommentCount commentCount={idea.attributes.comments_count} />
        )}
      </Left>
      {!hideIdeaStatus && ideaStatusId && (
        <Right>
          <StyledStatusBadge statusId={ideaStatusId} maxLength={20} />
        </Right>
      )}
    </Container>
  );
};

export default IdeationFooter;
