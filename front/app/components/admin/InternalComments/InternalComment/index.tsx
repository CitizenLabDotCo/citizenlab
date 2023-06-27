// libraries
import React, { useState, useEffect } from 'react';

// components
import InternalCommentHeader from './InternalCommentHeader';
import InternalCommentBody from './InternalCommentBody';
import InternalCommentFooter from './InternalCommentFooter';
import { Icon, Box } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import commentsMessages from 'components/PostShowComponents/Comments/messages';

// style
import styled, { keyframes, css } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import useInternalComment from 'api/internal_comments/useInternalComment';
import useUserById from 'api/users/useUserById';

// Utils
import { scrollToElement } from 'utils/scroll';

// hooks
import { useLocation } from 'react-router-dom';

const highlightAnimation = keyframes`
  0% {
    opacity: 0;
  }
  25% {
    opacity: 0.25;
  }
  50% {
    opacity: 0.5;
  }
  75% {
    opacity: 0.75;
  }
  100% {
    opacity: 1;
  }
`;

const Container = styled(Box)<{ animate?: boolean }>`
  ${({ animate }) =>
    animate &&
    css`
      animation: ${highlightAnimation} 2s 3 ease-in-out;
    `};
`;

const ContainerInner = styled.div`
  position: relative;

  &.child {
    margin-top: 20px;
    margin-left: 38px;
  }
`;

const Content = styled.div`
  display: flex;
  margin-left: 39px;
`;

const BodyAndFooter = styled.div`
  flex: 1;
`;

const DeletedComment = styled.div`
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  font-style: italic;
`;

const DeletedIcon = styled(Icon)`
  margin-right: 12px;
  fill: ${colors.textSecondary};
`;

interface Props {
  ideaId: string | undefined;
  initiativeId: string | undefined;
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

const InternalComment = ({
  ideaId,
  initiativeId,
  projectId,
  commentType,
  commentId,
  hasChildComments,
  last,
  className,
}: Props) => {
  const { data: comment } = useInternalComment(commentId);
  const { hash } = useLocation();
  const { data: author } = useUserById(
    comment?.data.relationships.author.data?.id
  );
  const [animateHighlight, setAnimateHighlight] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      // We are not using the hash from useLocation here because that isn't giving us the desired result. It doesn't scroll to the exact element.
      const elementId = window.location.hash.slice(1);
      const targetElement = document.getElementById(elementId);

      if (targetElement) {
        requestAnimationFrame(() => {
          scrollToElement({ id: elementId });
          setAnimateHighlight(true);
          setTimeout(() => {
            setAnimateHighlight(false);
          }, 6000);
        });
      }
    };

    // Call the handler immediately to get the initial hash value
    handleHashChange();

    // Add event listener for hash change
    window.addEventListener('hashchange', handleHashChange);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const [editing, setEditing] = useState(false);

  const onEditing = () => {
    setEditing(true);
  };

  const onCancelEditing = () => {
    setEditing(false);
  };

  const onCommentSaved = () => {
    setEditing(false);
  };

  if (comment) {
    const commentId = comment.data.id;
    const authorId = author ? author.data.id : null;
    const lastComment =
      (commentType === 'parent' && !hasChildComments) ||
      (commentType === 'child' && last === true);

    return (
      <Container
        id={commentId}
        className={`${className || ''} ${commentType} ${
          commentType === 'parent'
            ? 'e2e-parentcomment'
            : 'e2e-internal-child-comment'
        } e2e-comment`}
        animate={hash === `#${commentId}` && animateHighlight}
      >
        <ContainerInner
          className={`${commentType} ${lastComment ? 'lastComment' : ''}`}
        >
          {
            // Don't show deleted comments. Better to have a filter in the BE.
          }
          {comment.data.attributes.publication_status === 'published' && (
            <>
              <InternalCommentHeader
                projectId={projectId}
                commentAttributes={comment.data.attributes}
                commentType={commentType}
                className={commentType === 'parent' ? 'marginBottom' : ''}
                authorId={authorId}
              />

              <Content>
                <BodyAndFooter>
                  <InternalCommentBody
                    commentId={commentId}
                    commentType={commentType}
                    editing={editing}
                    onCommentSaved={onCommentSaved}
                    onCancelEditing={onCancelEditing}
                    ideaId={ideaId}
                    initiativeId={initiativeId}
                  />
                  <InternalCommentFooter
                    className={commentType}
                    ideaId={ideaId}
                    initiativeId={initiativeId}
                    projectId={projectId}
                    commentId={commentId}
                    commentType={commentType}
                    onEditing={onEditing}
                    authorId={authorId}
                  />
                </BodyAndFooter>
              </Content>
            </>
          )}

          {comment.data.attributes.publication_status === 'deleted' && (
            <DeletedComment>
              <DeletedIcon name="delete" />
              <FormattedMessage
                {...commentsMessages.commentDeletedPlaceholder}
              />
            </DeletedComment>
          )}
        </ContainerInner>
      </Container>
    );
  }
  return null;
};

export default InternalComment;
