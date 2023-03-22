import React from 'react';

// components
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
import CommentCount from './CommentCount';

// styles
import styled from 'styled-components';
import { IIdea } from 'api/ideas/types';

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
  margin-right: 4px;
`;

interface Props {
  idea: IIdea;
  hideIdeaStatus?: boolean;
  className?: string;
  showCommentCount: boolean;
}

const FooterWithVoteControl = ({
  idea,
  hideIdeaStatus,
  className,
  showCommentCount,
}: Props) => {
  const ideaStatusId = idea.data.relationships.idea_status.data.id;

  return (
    <Container className={className || ''}>
      <Left>
        <StyledVoteControl
          styleType="border"
          ideaId={idea.data.id}
          size="1"
          ariaHidden
        />

        {showCommentCount && (
          <CommentCount commentCount={idea.data.attributes.comments_count} />
        )}
      </Left>
      {!hideIdeaStatus && (
        <Right>
          <StyledStatusBadge statusId={ideaStatusId} />
        </Right>
      )}
    </Container>
  );
};

export default FooterWithVoteControl;
