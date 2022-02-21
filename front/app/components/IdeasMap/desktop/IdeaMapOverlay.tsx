import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import CSSTransition from 'react-transition-group/CSSTransition';

// events
import { ideaMapCardSelected$, setIdeaMapCardSelected } from '../events';

// hooks
import useProject from 'hooks/useProject';
import { useWindowSize } from '@citizenlab/cl2-component-library';

// components
import IdeasList from './IdeasList';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

// styling
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

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

const StyledIdeasList = styled(IdeasList)`
  flex: 1;
  overflow: hidden;
`;

interface Props {
  projectIds: string[];
  projectId: string;
  phaseId?: string | null;
  className?: string;
}

const IdeaMapOverlay = memo<Props>(
  ({ projectIds, projectId, phaseId, className }) => {
    const project = useProject({ projectId });
    const { windowWidth } = useWindowSize();
    const smallerThan1440px = !!(windowWidth && windowWidth <= 1440);

    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
    const [scrollContainerElement, setScrollContainerElement] =
      useState<HTMLDivElement | null>(null);

    useEffect(() => {
      const subscription = ideaMapCardSelected$.subscribe((ideaId) => {
        setSelectedIdeaId(ideaId);
      });

      return () => {
        setIdeaMapCardSelected(null);
        subscription.unsubscribe();
      };
    }, [projectIds, projectId]);

    useEffect(() => {
      if (scrollContainerElement && selectedIdeaId) {
        scrollContainerElement.scrollTop = 0;
      }
    }, [scrollContainerElement, selectedIdeaId]);

    const goBack = () => {
      setIdeaMapCardSelected(null);
    };

    const handleIdeasShowSetRef = (element: HTMLDivElement) => {
      setScrollContainerElement(element);
    };

    if (!isNilOrError(project)) {
      return (
        <Container className={className || ''}>
          <StyledIdeasList
            projectIds={projectIds}
            projectId={projectId}
            phaseId={phaseId}
          />
          <CSSTransition
            classNames="animation"
            in={!!selectedIdeaId}
            timeout={timeout}
            mounOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <InnerOverlay right={smallerThan1440px ? '-100px' : '-150px'}>
              <StyledIdeaShowPageTopBar
                ideaId={selectedIdeaId as string}
                goBackAction={goBack}
                projectId={projectId}
                insideModal={false}
              />
              <StyledIdeasShow
                ideaId={selectedIdeaId as string}
                projectId={projectId}
                insideModal={false}
                compact={true}
                setRef={handleIdeasShowSetRef}
              />
            </InnerOverlay>
          </CSSTransition>
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapOverlay;
