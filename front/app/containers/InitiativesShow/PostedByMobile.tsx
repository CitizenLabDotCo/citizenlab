import React from 'react';

import { fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import UserName from 'components/UI/UserName';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

const Container = styled.div`
  display: flex;
  align-items: center;
`;

const PostedByText = styled.span`
  color: white;
  font-size: ${fontSizes.base}px;
  margin-bottom: 3px;
`;

interface Props {
  authorId: string | null | undefined;
  className?: string;
}

const PostedByMobile = ({ authorId, className }: Props) => {
  if (authorId) {
    return (
      <Container className={`e2e-idea-author ${className || ''}`}>
        <PostedByText>
          <FormattedMessage
            {...messages.postedByShort}
            values={{
              authorName: (
                <UserName
                  userId={authorId}
                  fontWeight={500}
                  isLinkToProfile
                  color="white"
                  underline
                />
              ),
            }}
          />
        </PostedByText>
      </Container>
    );
  }

  return null;
};

export default PostedByMobile;
