import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { ICommentData } from 'api/comments/types';
import useComments from 'api/comments/useComments';

import Comment from './Comment';

interface Props {
  comment: ICommentData;
}

const TopLevelComment = ({ comment }: Props) => {
  const { data: comments } = useComments({
    commentId: comment.id,
    pageSize: 5,
  });

  const commentsList = comments?.pages.flatMap((page) => page.data);

  return (
    <Box>
      <Comment comment={comment} />
      <Box borderLeft={`4px solid ${colors.divider}`} pl="8px">
        {commentsList?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </Box>
    </Box>
  );
};

export default TopLevelComment;
