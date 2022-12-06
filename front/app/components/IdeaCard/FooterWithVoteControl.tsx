import React from 'react';
// styles
import styled from 'styled-components';
import { IIdeaData } from 'services/ideas';
// components
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
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

const StyledVoteControl = styled(VoteControl)`
  margin-right: 4px;
`;

interface Props {
  idea: IIdeaData;
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
  const ideaStatusId = idea.relationships.idea_status.data.id;

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
};

export default FooterWithVoteControl;
