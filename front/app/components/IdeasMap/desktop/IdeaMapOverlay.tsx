import React, { memo, useState, useEffect } from 'react';

import {
  useWindowSize,
  defaultCardStyle,
} from '@citizenlab/cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

import MapIdeasList from './MapIdeasList';

const timeout = 200;

const Container = styled.div`
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  ${defaultCardStyle};
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.12);
`;

const InnerOverlay = styled.div<{ right: string }>`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: ${(props) => props.right};
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  ${defaultCardStyle};
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  transition: all ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);

  &.animation-enter {
    opacity: 0;
    right: 0px;

    &.animation-enter-active {
      opacity: 1;
      right: ${(props) => props.right};
    }
  }

  &.animation-enter-done {
    opacity: 1;
    right: ${(props) => props.right};
  }

  &.animation-exit {
    opacity: 1;
    right: ${(props) => props.right};

    &.animation-exit-active {
      opacity: 0;
      right: 0px;
    }
  }

  &.animation-exit-done {
    display: none;
  }
`;

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)``;

const StyledIdeasShow = styled(IdeasShow)`
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 30px;
`;

const StyledIdeasList = styled(MapIdeasList)`
  flex: 1;
  overflow: hidden;
`;

interface Props {
  projectId: string;
  phaseId?: string;
  className?: string;
  onSelectIdea: (ideaId: string | null) => void;
  selectedIdea?: string | null;
}

const IdeaMapOverlay = memo<Props>(
  ({ projectId, phaseId, className, selectedIdea, onSelectIdea }) => {
    const { data: project } = useProjectById(projectId);
    const { windowWidth } = useWindowSize();
    const smallerThan1440px = !!(windowWidth && windowWidth <= 1440);

    const [scrollContainerElement, setScrollContainerElement] =
      useState<HTMLDivElement | null>(null);

    useEffect(() => {
      if (scrollContainerElement && selectedIdea) {
        scrollContainerElement.scrollTop = 0;
      }
    }, [scrollContainerElement, selectedIdea]);

    const handleIdeasShowSetRef = (element: HTMLDivElement) => {
      setScrollContainerElement(element);
    };

    if (project) {
      return (
        <Container className={className || ''}>
          <StyledIdeasList
            projectId={projectId}
            phaseId={phaseId}
            onSelectIdea={onSelectIdea}
          />
          <CSSTransition
            classNames="animation"
            in={!!selectedIdea}
            timeout={timeout}
            mounOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <InnerOverlay right={smallerThan1440px ? '-100px' : '-150px'}>
              <StyledIdeaShowPageTopBar
                ideaId={selectedIdea ?? undefined}
                deselectIdeaOnMap={() => {
                  onSelectIdea(null);
                }}
                projectId={projectId}
              />
              {selectedIdea && (
                <StyledIdeasShow
                  ideaId={selectedIdea}
                  projectId={projectId}
                  compact={true}
                  setRef={handleIdeasShowSetRef}
                />
              )}
            </InnerOverlay>
          </CSSTransition>
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapOverlay;
