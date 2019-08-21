import React, { memo } from 'react';

// components
import UserName from 'components/UI/UserName';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;
`;

const PostedByText = styled.span`
  color: white;
  font-size: ${fontSizes.base}px;
  margin-bottom: 3px;
`;

interface Props {
  authorId: string | null;
  className?: string;
}

const PostedBy = memo<Props>(({ authorId, className }) => {

  if (authorId) {
    const authorName = <UserName userId={authorId} emphasize linkToProfile hideLastName color="white" />;

    return (
      <Container className={`e2e-idea-author ${className || ''}`}>
        <PostedByText>
          <FormattedMessage {...messages.postedByShort} values={{ authorName }} />
        </PostedByText>
      </Container>
    );
  }

  return null;

});

export default PostedBy;
