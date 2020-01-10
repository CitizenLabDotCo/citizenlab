import React, { memo, useMemo, useCallback, useEffect } from 'react';

// utils
import eventEmitter from 'utils/eventEmitter';
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

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// a11y
import { LiveMessage } from 'react-aria-live';

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
  postId: string;
  postType: 'idea' | 'initiative';
  comments: ICommentData[];
  sortOrder: CommentsSort;
  loading: boolean;
  onSortOrderChange: (sortOrder: CommentsSort) => void;
  className?: string;
}

const CommentsSection = memo<Props & InjectedIntlProps>(({ postId, postType, comments, sortOrder, loading, onSortOrderChange, className, intl: { formatMessage } }) => {
  const [a11y_postedCommentMessage, setA11y_postedCommentMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const subscription = eventEmitter.observeEvent('CommentAdded').subscribe(() => {
      setA11y_postedCommentMessage(formatMessage(messages.a11y_commentPosted));
      setTimeout(() => setA11y_postedCommentMessage(''), 1000);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = eventEmitter.observeEvent('CommentDeleted').subscribe(() => {
    });

    return () => subscription.unsubscribe();
  }, []);

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

        <LiveMessage message={a11y_postedCommentMessage} aria-live="polite" />

        {sortedParentComments.map((parentComment, _index) => {
          const childCommentIds = (!isNilOrError(comments) && comments.filter((comment) => {
            if (
              comment.relationships.parent.data &&
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
              postId={postId}
              postType={postType}
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

export default injectIntl(CommentsSection);
