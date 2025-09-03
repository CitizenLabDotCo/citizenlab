import React, { memo, useState, useEffect, useRef } from 'react';

import {
  useWindowSize,
  defaultCardStyle,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

import { InputFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar/InputFilters';

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
  &:focus {
    outline: none;
  }

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
  selectedIdeaId: string | null;
  inputFiltersProps?: InputFiltersProps;
}

const IdeaMapOverlay = memo<Props>(
  ({
    projectId,
    phaseId,
    className,
    selectedIdeaId,
    onSelectIdea,
    inputFiltersProps,
  }) => {
    const { data: project } = useProjectById(projectId);
    const { data: idea } = useIdeaById(
      typeof selectedIdeaId === 'string' ? selectedIdeaId : undefined
    );
    const { data: phase } = usePhase(phaseId);
    const { windowWidth } = useWindowSize();
    const timeoutRef = useRef<number>();
    const smallerThan1440px = !!(windowWidth && windowWidth <= 1440);
    const isMobileOrSmaller = useBreakpoint('phone');

    const [scrollContainerElement, setScrollContainerElement] =
      useState<HTMLDivElement | null>(null);

    const overlayRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (scrollContainerElement && selectedIdeaId) {
        scrollContainerElement.scrollTop = 0;
      }
    }, [scrollContainerElement, selectedIdeaId]);

    useEffect(() => {
      const currentTimeout = timeoutRef.current;
      // Cleanup the timeout if the component unmounts before the timeout executes
      return () => {
        if (currentTimeout) {
          clearTimeout(currentTimeout);
        }
      };
    }, []);

    const handleIdeasShowSetRef = (element: HTMLDivElement) => {
      setScrollContainerElement(element);
    };

    const handleSelectIdea = (ideaId: string | null) => {
      onSelectIdea(ideaId);

      timeoutRef.current = window.setTimeout(() => {
        // We move focus from the idea list to the overlay so that user can easily
        // tab through the idea details in the overlay after selecting an idea
        overlayRef.current?.focus();
        // Clear the timeout after it has been used
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = undefined;
        }
      }, 0);
    };
    const showList = isMobileOrSmaller ? true : !selectedIdeaId;

    if (project) {
      return (
        <Container className={className || ''}>
          {showList && (
            <StyledIdeasList
              projectId={projectId}
              phaseId={phaseId}
              onSelectIdea={handleSelectIdea}
              inputFiltersProps={inputFiltersProps}
            />
          )}
          {!isMobileOrSmaller && idea && (
            <CSSTransition
              classNames="animation"
              in={true}
              timeout={timeout}
              mountOnEnter={true}
              unmountOnExit={true}
              enter={true}
              exit={true}
            >
              <InnerOverlay
                right={smallerThan1440px ? '-100px' : '-150px'}
                tabIndex={-1}
                // Ref to use to focus on the overlay after selecting an idea
                ref={overlayRef}
              >
                <IdeaShowPageTopBar
                  idea={idea.data}
                  deselectIdeaOnMap={() => {
                    onSelectIdea(null);
                  }}
                  // This component is only used when there's timeline context atm.
                  // This means that, in practice, there should always be a phase (id).
                  phase={phase?.data}
                />
                <StyledIdeasShow
                  ideaId={idea.data.id}
                  projectId={projectId}
                  compact={true}
                  setRef={handleIdeasShowSetRef}
                />
              </InnerOverlay>
            </CSSTransition>
          )}
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapOverlay;
