import React, { memo } from 'react';
import { get } from 'lodash-es';

// components
import { Icon } from 'cl2-component-library';
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
import { IIdeaData } from 'services/ideas';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const CommentsCount = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 28px;
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

interface Props {
  idea: IIdeaData;
}

const CompactIdeaCard = memo<Props>(({ idea }) => {
  const votingDescriptor = idea?.attributes?.action_descriptor?.voting_idea;
  const ideaStatusId = get(idea, 'relationships.idea_status.data.id');
  return (
    <Footer>
      <VoteControl
        style="compact"
        ideaId={idea.id}
        size="1"
        ariaHidden
        showDownvote={votingDescriptor?.downvoting_enabled}
      />
      <CommentsCount>
        <CommentIcon name="comments" />
        {idea.attributes.comments_count}
      </CommentsCount>
      <StatusBadge statusId={ideaStatusId} />
    </Footer>
  );
});

export default CompactIdeaCard;
