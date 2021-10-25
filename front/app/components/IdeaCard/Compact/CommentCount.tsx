import React from 'react';
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { Icon } from 'cl2-component-library';

const Container = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
`;

const CommentIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 8px;
`;

interface Props {
  commentCount: number;
}

const CommentCount = ({ commentCount }: Props) => {
  return (
    <Container className="e2e-ideacard-comment-count">
      <CommentIcon name="comments" />
      {commentCount}
    </Container>
  );
};

export default CommentCount;
