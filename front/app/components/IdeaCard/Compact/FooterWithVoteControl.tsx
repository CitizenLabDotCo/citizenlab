import React, { memo } from 'react';

// components
import { Icon } from 'cl2-component-library';
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
import { IIdeaData } from 'services/ideas';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.footer`
  display: flex;
  align-items: center;
`;

const Left = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const CommentsCount = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;

  &.disabled {
    opacity: 0.71;
  }
`;

const CommentIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 8px;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const StyledStatusBadge = styled(StatusBadge)`
  display: block;
  margin-left: 25px;
`;

interface Props {
  idea: IIdeaData;
  hideIdeaStatus?: boolean;
  className?: string;
}

const FooterWithVoteControl = memo<Props>(
  ({ idea, hideIdeaStatus, className }) => {
    const ideaStatusId = idea?.relationships?.idea_status?.data.id;
    const commentingDescriptor =
      idea?.attributes?.action_descriptor?.commenting_idea;
    const isCommentingEnabled = !!(
      commentingDescriptor.enabled ||
      commentingDescriptor.disabled_reason === 'not_signed_in'
    );

    return (
      <Container className={className || ''}>
        <Left>
          <VoteControl style="compact" ideaId={idea.id} size="1" ariaHidden />

          <CommentsCount
            className={[
              'e2e-ideacard-comment-count',
              isCommentingEnabled ? 'enabled' : 'disabled',
            ]
              .filter((item) => item)
              .join(' ')}
          >
            <CommentIcon name="comments" />
            {idea.attributes.comments_count}
          </CommentsCount>
        </Left>
        {!hideIdeaStatus && (
          <Right>
            <StyledStatusBadge statusId={ideaStatusId} />
          </Right>
        )}
      </Container>
    );
  }
);

export default FooterWithVoteControl;
