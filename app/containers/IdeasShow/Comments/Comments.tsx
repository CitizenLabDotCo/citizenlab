import React, { memo, useState, useMemo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentComment from './ParentComment';
import CommentSorting, { ICommentSortOptions } from './CommentSorting';
import Spinner from 'components/UI/Spinner';

// services
import { ICommentData } from 'services/comments';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  position: relative;
`;

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  z-index: 2;
`;

const StyledCommentSorting = styled(CommentSorting)`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;

  ${media.smallerThanMinTablet`
    justify-content: flex-start;
    margin-bottom: 15px;
  `}
`;

const StyledParentComment = styled(ParentComment)`
  &.loading {
    opacity: 0;
  }
`;

interface Props {
  ideaId: string;
  comments: ICommentData[];
  sortOrder: ICommentSortOptions;
  onSortOrderChange: (sortOrder: ICommentSortOptions) => void;
  className?: string;
}

const CommentsSection = memo<Props>(({ ideaId, comments, sortOrder, onSortOrderChange, className }) => {

  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      trackEventByName(tracks.clickCommentsSortOrder);
      onSortOrderChange(sortOrder);
      setTimeout(() => setLoading(false), 300);
    }, []
  );

  if (sortedParentComments && sortedParentComments.length > 0) {
    return (
      <Container className={`e2e-comments-container ${className}`}>
        {loading &&
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        }

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
            <StyledParentComment
              key={parentComment.id}
              ideaId={ideaId}
              commentId={parentComment.id}
              childCommentIds={childCommentIds}
              className={loading ? 'loading' : ''}
            />
          );
        })}

      </Container>
    );
  }

  return null;
});

export default CommentsSection;
