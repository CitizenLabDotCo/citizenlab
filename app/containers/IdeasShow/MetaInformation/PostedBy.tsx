import React, { memo } from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';

// components
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { FormattedDate } from 'react-intl';

// hooks
import useIdea from 'hooks/useIdea';

const Container = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.label};
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 5px;
`;

export interface Props {
  className?: string;
  authorId: string | null;
  ideaId: string;
}

const PostedBy = memo<Props>(({ className, authorId, ideaId }) => {
  const userName = (
    <UserName
      userId={authorId}
      isLinkToProfile
      underline
      color={colors.label}
    />
  );
  const idea = useIdea({ ideaId });

  if (!isNilOrError(idea)) {
    const ideaPublishedAtDate = idea.attributes.published_at;
    const date = (
      <FormattedDate
        value={ideaPublishedAtDate}
        year="numeric"
        month="long"
        day="numeric"
      />
    );

    return (
      <Container className={`e2e-idea-author ${className || ''}`}>
        <StyledAvatar
          userId={authorId}
          size="32px"
          isLinkToProfile={!!authorId}
        />
        <FormattedMessage
          {...messages.byUserOnDate}
          values={{ userName, date }}
        />
      </Container>
    );
  }

  return null;
});

export default PostedBy;
