import React from 'react';

// components
import CommentCount from './CommentCount';
import { Box } from '@citizenlab/cl2-component-library';

// types
import { IIdeaData } from 'api/ideas/types';

// styles
import ReadMoreButton from './ReadMoreButton';

interface Props {
  idea: IIdeaData;
  showCommentCount: boolean;
}

const IdeaCardFooter = ({ idea, showCommentCount }: Props) => {
  return (
    <Box as="footer" w="100%" display="flex" mt="16px" justifyContent="center">
      <ReadMoreButton slug={idea.attributes.slug} />
      {showCommentCount && (
        <CommentCount commentCount={idea.attributes.comments_count} />
      )}
    </Box>
  );
};
export default IdeaCardFooter;
