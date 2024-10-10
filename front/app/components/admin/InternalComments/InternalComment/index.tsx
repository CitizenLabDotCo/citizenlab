import React, { useState, useEffect } from 'react';

import {
  Icon,
  Box,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import useInternalComment from 'api/internal_comments/useInternalComment';
import useUserById from 'api/users/useUserById';

import commentsMessages from 'components/PostShowComponents/Comments/messages';

import { FormattedMessage } from 'utils/cl-intl';
import { scrollToElement } from 'utils/scroll';

import InternalCommentBody from './InternalCommentBody';
import InternalCommentFooter from './InternalCommentFooter';
import InternalCommentHeader from './InternalCommentHeader';

const highlightAnimation = keyframes`
  0% {
    background-color: transparent;
  }
  50% {
    background-color: ${colors.grey200};
  }
  100% {
    background-color: transparent;
  }
`;

const Container = styled(Box)<{ animate?: boolean }>`
  ${({ animate }) =>
    animate &&
    css`
      animation: ${highlightAnimation} 3s ease-in-out;
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
  projectId?: string | null;
  commentId: string;
  commentType: 'parent' | 'child';
  hasChildComments?: boolean;
  last?: boolean;
  className?: string;
}

const InternalComment = ({
  ideaId,
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
          }, 3000);
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
                  />
                  <InternalCommentFooter
                    className={commentType}
                    ideaId={ideaId}
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
