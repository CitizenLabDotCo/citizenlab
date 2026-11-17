import React from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 20px;
`;

const Block = styled.div`
  display: flex;
  align-items: center;
`;

const ReactionsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const LikesContainer = styled(ReactionsContainer)`
  margin-right: 30px;
`;

const DislikesContainer = styled(ReactionsContainer)``;

const ReactionIcon = styled(Icon)`
  margin-right: 5px;
`;

const LikeIcon = styled(ReactionIcon)`
  fill: ${colors.success};
  margin-top: -2px;
`;

const DislikeIcon = styled(ReactionIcon)`
  fill: ${colors.error};
  margin-top: 6px;
`;

const ReactionsCount = styled.div`
  font-size: ${fontSizes.l}px;
  font-weight: 600;
`;

const LikesCount = styled(ReactionsCount)`
  color: ${colors.success};
`;

const DislikesCount = styled(ReactionsCount)`
  color: ${colors.error};
`;

interface Props {
  ideaId: string;
  className?: string;
}

const ReactionPreview = ({ ideaId, className }: Props) => {
  const { data: idea } = useIdeaById(ideaId);

  if (!isNilOrError(idea)) {
    const likesCount = idea.data.attributes.likes_count;
    const dislikesCount = idea.data.attributes.dislikes_count;

    return (
      <Container className={className}>
        <Label>
          <FormattedMessage {...messages.reactionCounts} />
        </Label>
        <Block>
          <LikesContainer>
            <LikeIcon name="vote-up" />
            <LikesCount>{likesCount}</LikesCount>
          </LikesContainer>
          <DislikesContainer>
            <DislikeIcon name="vote-down" />
            <DislikesCount>{dislikesCount}</DislikesCount>
          </DislikesContainer>
        </Block>
      </Container>
    );
  }

  return null;
};

export default ReactionPreview;
