import React from 'react';

import {
  Box,
  Button,
  Spinner,
  colors,
} from '@citizenlab/cl2-component-library';

import { ICommentData } from 'api/comments/types';
import useComments from 'api/comments/useComments';

import Comment from './Comment';

interface Props {
  comment: ICommentData;
}

const TopLevelComment = ({ comment }: Props) => {
  const {
    data: comments,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useComments(
    {
      commentId: comment.id,
      pageSize: 5,
    },
    !!comment.attributes.children_count
  );

  const commentsList = comments?.pages.flatMap((page) => page.data);

  return (
    <Box>
      <Comment comment={comment} />
      <Box borderLeft={`4px solid ${colors.divider}`} pl="8px">
        {commentsList?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
        {hasNextPage && !isFetchingNextPage && (
          <Button
            buttonStyle="secondary"
            size="s"
            onClick={fetchNextPage}
            width="auto"
            px="8px"
            py="4px"
            my="16px"
          >
            Load more
          </Button>
        )}
        {isFetchingNextPage && (
          <Box my="24px">
            <Spinner />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TopLevelComment;
