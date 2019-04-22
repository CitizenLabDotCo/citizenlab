import React, { memo, useMemo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentComment from './ParentComment';
import CommentSorting, { ICommentSortOptions } from './CommentSorting';

// services
import { ICommentData } from 'services/comments';

// style
import styled from 'styled-components';

const Container = styled.div`
  margin-top: 30px;
`;

const StyledCommentSorting = styled(CommentSorting)`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
`;

interface Props {
  ideaId: string;
  comments: ICommentData[];
  sortOrder: ICommentSortOptions;
  onSortOrderChange: (sortOrder: ICommentSortOptions) => void;
  className?: string;
}

const CommentsSection = memo<Props>(({ ideaId, comments, sortOrder, onSortOrderChange, className }) => {

  const sortedParentComments = useMemo(() => {
    const sortByDate = (commentA: ICommentData, commentB: ICommentData) => new Date(commentA.attributes.created_at).getTime() - new Date(commentB.attributes.created_at).getTime();
    const sortByUpvoteCount = (commentA: ICommentData, commentB: ICommentData) => commentB.attributes.upvotes_count - commentA.attributes.upvotes_count;
    let sortedParentComments: ICommentData[] = [];

    if (!isNilOrError(comments) && comments.length > 0) {
      const parentComments = comments.filter(comment => comment.relationships.parent.data === null);

      sortedParentComments = parentComments.sort((commentA, commentB) => {
        if (sortOrder === 'oldest_to_newest' || commentB.attributes.upvotes_count === commentA.attributes.upvotes_count) {
          return sortByDate(commentA, commentB);
        }

        return sortByUpvoteCount(commentA, commentB);
      });
    }

    return sortedParentComments;
  }, [sortOrder, comments]);

  const handleSortOrderChange = useCallback(
    (sortOrder: 'oldest_to_newest' | 'most_upvoted') => {
      onSortOrderChange(sortOrder);
    }, []
  );

  if (sortedParentComments && sortedParentComments.length > 0) {
    return (
      <Container className={`e2e-comments-container ${className}`}>
        <StyledCommentSorting onChange={handleSortOrderChange} />

        {sortedParentComments.map((parentComment, _index) => {
          const childCommentIds = (!isNilOrError(comments) && comments.filter((comment) => {
            if (comment.relationships.parent.data &&
                comment.relationships.parent.data.id === parentComment.id &&
                comment.attributes.publication_status !== 'deleted'
            ) {
              return true;
            }

            return false;
          }).map(comment => comment.id));

          return (
            <ParentComment
              key={parentComment.id}
              ideaId={ideaId}
              commentId={parentComment.id}
              childCommentIds={childCommentIds}
            />
          );
        })}
      </Container>
    );
  }

  return null;
});

export default CommentsSection;
