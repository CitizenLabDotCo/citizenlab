import React, { memo } from 'react';

// components
import { Icon } from 'cl2-component-library';
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
import { IIdeaData } from 'services/ideas';

// styles
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const CommentsCount = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  margin-left: 28px;
  margin-right: 25px;

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

const Footer = styled.footer`
  display: flex;
`;

const StyledStatusBadge = styled(StatusBadge)`
  display: block;

  ${media.smallerThan1200px`
    display: none;
  `}

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

interface Props {
  idea: IIdeaData;
}

const CompactIdeaCard = memo<Props>(({ idea }) => {
  const ideaStatusId = idea?.relationships?.idea_status?.data.id;
  const isDownVotingEnabled = !!idea?.attributes?.action_descriptor?.voting_idea
    ?.downvoting_enabled;
  const commentingDescriptor =
    idea?.attributes?.action_descriptor?.commenting_idea;
  const isCommentingEnabled = !!(
    commentingDescriptor.enabled ||
    commentingDescriptor.disabled_reason === 'not_signed_in'
  );

  return (
    <Footer>
      <VoteControl
        style="compact"
        ideaId={idea.id}
        size="1"
        ariaHidden
        showDownvote={isDownVotingEnabled}
      />
      <CommentsCount className={isCommentingEnabled ? 'enabled' : 'disabled'}>
        <CommentIcon name="comments" />
        {idea.attributes.comments_count}
      </CommentsCount>
      <StyledStatusBadge statusId={ideaStatusId} />
    </Footer>
  );
});

export default CompactIdeaCard;
