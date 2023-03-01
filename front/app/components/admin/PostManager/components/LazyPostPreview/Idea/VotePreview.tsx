import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// resources
import useIdea from 'hooks/useIdea';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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

const VotesContainer = styled.div`
  display: flex;
  align-items: center;
`;

const UpvotesContainer = styled(VotesContainer)`
  margin-right: 30px;
`;

const DownvotesContainer = styled(VotesContainer)``;

const VoteIcon = styled(Icon)`
  margin-right: 5px;
`;

const UpvoteIcon = styled(VoteIcon)`
  fill: ${colors.success};
  margin-top: -2px;
`;

const DownvoteIcon = styled(VoteIcon)`
  fill: ${colors.error};
  margin-top: 6px;
`;

const VotesCount = styled.div`
  font-size: ${fontSizes.l}px;
  font-weight: 600;
`;

const UpvotesCount = styled(VotesCount)`
  color: ${colors.success};
`;

const DownvotesCount = styled(VotesCount)`
  color: ${colors.error};
`;

interface Props {
  ideaId: string;
  className?: string;
}

const VotePreview = ({ ideaId, className }: Props) => {
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const upvotesCount = idea.attributes.upvotes_count;
    const downvotesCount = idea.attributes.downvotes_count;

    return (
      <Container className={className}>
        <Label>
          <FormattedMessage {...messages.voteCounts} />
        </Label>
        <Block>
          <UpvotesContainer>
            <UpvoteIcon name="vote-up" />
            <UpvotesCount>{upvotesCount}</UpvotesCount>
          </UpvotesContainer>
          <DownvotesContainer>
            <DownvoteIcon name="vote-down" />
            <DownvotesCount>{downvotesCount}</DownvotesCount>
          </DownvotesContainer>
        </Block>
      </Container>
    );
  }

  return null;
};

export default VotePreview;
