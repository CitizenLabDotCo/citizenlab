import React, { useState, useEffect, useRef } from 'react';

import { useSearchParams } from 'react-router-dom';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isString } from 'utils/helperUtils';

import {
  pageContentMaxWidth,
  contentFadeInDuration,
  contentFadeInEasing,
  contentFadeInDelay,
} from '../styleConstants';

import IdeaSharingModal from './IdeaSharingModal';

const Container = styled.div`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  background: #fff;

  &.loading {
    flex: 1;
    justify-content: center;
  }

  &.isLoaded {
    opacity: 0;

    &.content-enter {
      opacity: 0;

      &.content-enter-active {
        opacity: 1;
        transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing}
          ${contentFadeInDelay}ms;
      }
    }

    &.content-enter-done {
      opacity: 1;
    }
  }
`;

interface Props {
  projectId: string;
  className?: string;
  children: React.ReactNode;
  handleContainerRef: (element: HTMLElement | null) => void;
}

{
  /*
  On "Container2" naming: I didn't try to come up with a better name because this shouldn't be a separate component.
  It makes it harder to understand IdeasShow with no benefits.
  This component needs to be reintegrated into IdeasShow instead, then extract
  the modal perhaps.
*/
}
const Container2 = ({
  projectId,
  className,
  children,
  handleContainerRef,
}: Props) => {
  const { data: project } = useProjectById(projectId);
  const [searchParams] = useSearchParams();
  const ideaIdParameter = searchParams.get('new_idea_id');
  const [newIdeaId, setNewIdeaId] = useState<string | null>(null);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isString(ideaIdParameter)) {
      timeout.current = setTimeout(() => {
        setNewIdeaId(ideaIdParameter);
      }, 1500);
    }

    removeSearchParams(['new_idea_id']);
  }, [ideaIdParameter]);

  const closeIdeaSocialSharingModal = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setNewIdeaId(null);
  };

  if (!project) return null;

  return (
    <>
      <CSSTransition
        classNames="content"
        in={true}
        timeout={{
          enter: contentFadeInDuration + contentFadeInDelay,
          exit: 0,
        }}
        enter={true}
        exit={false}
      >
        <Container
          className={`loaded ${className || ''}`}
          ref={handleContainerRef}
        >
          {children}
        </Container>
      </CSSTransition>
      {typeof newIdeaId === 'string' && (
        <IdeaSharingModal
          projectId={projectId}
          newIdeaId={newIdeaId}
          closeIdeaSocialSharingModal={closeIdeaSocialSharingModal}
        />
      )}
    </>
  );
};

export default Container2;
