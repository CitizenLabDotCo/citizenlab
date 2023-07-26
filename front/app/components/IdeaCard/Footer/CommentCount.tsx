import React from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from '@citizenlab/cl2-component-library';
import { ScreenReaderOnly } from 'utils/a11y';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

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
