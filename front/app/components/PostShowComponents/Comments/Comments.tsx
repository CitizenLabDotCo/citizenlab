import React, { memo, useEffect, useMemo, useState } from 'react';

// components
import ParentComment from './ParentComment';
import { Spinner } from '@citizenlab/cl2-component-library';
import Centerer from 'components/UI/Centerer';

// services
import { ICommentData } from 'api/comments/types';

// events
import { commentAdded$, commentDeleted$ } from './events';

// style
import styled from 'styled-components';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// a11y
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  position: relative;
`;

const StyledParentComment = styled(ParentComment)`
  &.loading {
    opacity: 0;
  }
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  allComments: ICommentData[];
  loading: boolean;
  className?: string;
}

const CommentsSection = memo<Props & WrappedComponentProps>(
  ({
    postId,
    postType,
    allComments,
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
    }, [formatMessage]);

    const parentComments = useMemo(() => {
      return allComments.filter(
        (comment) => comment.relationships.parent.data === null
      );
    }, [allComments]);

    return (
      <Container className={`e2e-comments-container ${className}`}>
        <ScreenReaderOnly aria-live="polite">
          {commentPostedMessage || commentDeletedMessage}
        </ScreenReaderOnly>

        {loading && (
          <Centerer
            height="100px"
            position="absolute"
            top="40px"
            left="0"
            right="0"
            zIndex="2"
          >
            <Spinner />
          </Centerer>
        )}

        {parentComments.map((parentComment, _index) => {
          const childCommentIds = allComments
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
