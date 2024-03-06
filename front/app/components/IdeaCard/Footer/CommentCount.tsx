import React from 'react';

import { colors, fontSizes, Icon } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
`;

const CommentIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 8px;
`;

interface Props {
  commentCount: number;
}

const CommentCount = ({ commentCount }: Props) => {
  return (
    <Container className="e2e-ideacard-comment-count">
      <CommentIcon name="comments" width="16px" height="16px" />
      <span aria-hidden>{commentCount}</span>
      <ScreenReaderOnly>
        <FormattedMessage
          {...messages.xComments}
          values={{ commentsCount: commentCount }}
        />
      </ScreenReaderOnly>
    </Container>
  );
};

export default CommentCount;
