import React, { memo, useEffect, useState } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import ParentComment from './ParentComment';
import { Spinner } from 'cl2-component-library';

// services
import { ICommentData } from 'services/comments';

// events
import { commentAdded$, commentDeleted$ } from './events';

// style
import styled from 'styled-components';

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

const StyledParentComment = styled(ParentComment)`
  &.loading {
    opacity: 0;
  }
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  comments: ICommentData[];
  loading: boolean;
  className?: string;
}

const CommentsSection = memo<Props & InjectedIntlProps>(
  ({
    postId,
    postType,
    comments,
    loading,
    className,
    intl: { formatMessage },
  }) => {
    const [commentPostedMessage, setCommentPostedMessage] = useState('');
    const [commentDeletedMessage, setCommentDeletedMessage] = useState('');

    useEffect(() => {
      const subscriptions = [
        commentAdded$.subscribe(() => {
          setCommentPostedMessage(formatMessage(messages.a11y_commentPosted));
          setTimeout(() => setCommentPostedMessage(''), 1000);
        }),
        commentDeleted$.subscribe(() => {
          setCommentDeletedMessage(formatMessage(messages.a11y_commentDeleted));
          setTimeout(() => setCommentDeletedMessage(''), 1000);
        }),
      ];

      return () =>
        subscriptions.forEach((subscription) => subscription.unsubscribe());
    }, []);

    return (
      <Container className={`e2e-comments-container ${className}`}>
        <LiveMessage
          message={commentPostedMessage || commentDeletedMessage}
          aria-live="polite"
        />

        {loading && (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        )}

        {comments &&
          comments.map((parentComment, _index) => {
            const childCommentIds =
              !isNilOrError(comments) &&
              comments
                .filter((comment) => {
                  if (
                    comment.relationships.parent.data &&
                    comment.relationships.parent.data.id === parentComment.id &&
                    comment.attributes.publication_status !== 'deleted'
                  ) {
                    return true;
                  }

                  return false;
                })
                .map((comment) => comment.id);

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
);

export default injectIntl(CommentsSection);
