import React, { memo, useEffect, useMemo, useState } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { ICommentData } from 'api/comments/types';

import Centerer from 'components/UI/Centerer';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import { commentAdded$, commentDeleted$ } from '../../../events';
import messages from '../../../messages';

import ParentComment from './ParentComment';

const Container = styled.div`
  position: relative;
`;

const StyledParentComment = styled(ParentComment)`
  &.loading {
    opacity: 0;
  }
`;

interface Props {
  ideaId: string | undefined;
  allComments: ICommentData[];
  loading: boolean;
  className?: string;
  allowAnonymousParticipation?: boolean;
}

const CommentsSection = memo<Props>(
  ({
    ideaId,
    allComments,
    loading,
    className,
    allowAnonymousParticipation,
  }) => {
    const { formatMessage } = useIntl();
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
              ideaId={ideaId}
              commentId={parentComment.id}
              childCommentIds={childCommentIds}
              className={loading ? 'loading' : ''}
              allowAnonymousParticipation={allowAnonymousParticipation}
            />
          );
        })}
      </Container>
    );
  }
);

export default CommentsSection;
