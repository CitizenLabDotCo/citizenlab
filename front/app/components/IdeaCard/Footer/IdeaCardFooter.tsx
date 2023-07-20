import React from 'react';

// components
import CommentCount from './CommentCount';

// types
import { IIdeaData } from 'api/ideas/types';

// styles
import ReadMoreButton from './ReadMoreButton';
import styled from 'styled-components';

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  margin-right: auto;
  margin-left: auto;
  margin-top: 16px;
`;

interface Props {
  idea: IIdeaData;
  showCommentCount: boolean;
}

const IdeaCardFooter = ({ idea, showCommentCount }: Props) => {
  return (
    <Footer>
      <ReadMoreButton slug={idea.attributes.slug} />
      {showCommentCount && (
        <CommentCount commentCount={idea.attributes.comments_count} />
      )}
    </Footer>
  );
};
export default IdeaCardFooter;
