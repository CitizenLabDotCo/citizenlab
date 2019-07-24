import React, { memo, useMemo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentComment from './ParentComment';
import CommentSorting from './CommentSorting';
import Spinner from 'components/UI/Spinner';

// services
import { ICommentData, CommentsSort } from 'services/comments';

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
  margin-bottom: 15px;

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
  comments: ICommentData[];
  sortOrder: CommentsSort;
  loading: boolean;
  onSortOrderChange: (sortOrder: CommentsSort) => void;
  className?: string;
}

const CommentsSection = memo<Props>(({ comments, sortOrder, loading, onSortOrderChange, className }) => {

  const sortedParentComments = useMemo(() => {
    if (!isNilOrError(comments) && comments.length > 0) {
      return comments.filter(comment => comment.relationships.parent.data === null);
    }
    return null;
  }, [sortOrder, comments]);

  const handleSortOrderChange = useCallback(
    (sortOrder: CommentsSort) => {
      trackEventByName(tracks.clickCommentsSortOrder);
      onSortOrderChange(sortOrder);
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

        <StyledCommentSorting
          onChange={handleSortOrderChange}
          selectedValue={[sortOrder]}
        />

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
