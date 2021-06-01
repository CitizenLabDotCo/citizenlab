import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import CSSTransition from 'react-transition-group/CSSTransition';

// events
import { ideaMapCardSelected$, setIdeaMapCardSelected } from '../events';

// hooks
import useProject from 'hooks/useProject';

// components
import IdeasList from './IdeasList';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

// styling
import styled from 'styled-components';
import { defaultCardStyle, colors } from 'utils/styleUtils';

const timeout = 200;

const Container = styled.div`
  width: 100%;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  ${defaultCardStyle};
`;

const InnerOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: -150px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
  ${defaultCardStyle};
  transition: all ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);

  &.animation-enter {
    opacity: 0;
    right: 0px;

    &.animation-enter-active {
      opacity: 1;
      right: -150px;
    }
  }

  &.animation-enter-done {
    opacity: 1;
    right: -150px;
  }

  &.animation-exit {
    opacity: 1;
    right: -150px;

    &.animation-exit-active {
      opacity: 0;
      right: 0px;
    }
  }

  &.animation-exit-done {
    display: none;
  }
`;

// const ScrollContainer = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
// `;

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)``;

const StyledIdeasShow = styled(IdeasShow)`
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 30px;

  & .pbExpensesBox {
    box-shadow: none;
    background: ${colors.background};
  }
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
    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
    const project = useProject({ projectId });

    useEffect(() => {
      const subscription = ideaMapCardSelected$.subscribe((ideaId) => {
        setSelectedIdeaId(ideaId);
      });

      return () => {
        setIdeaMapCardSelected(null);
        subscription.unsubscribe();
      };
    }, [projectIds, projectId]);

    const goBack = () => {
      setIdeaMapCardSelected(null);
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
            <InnerOverlay>
              <StyledIdeaShowPageTopBar
                ideaId={selectedIdeaId as string}
                goBackAction={goBack}
              />
              <StyledIdeasShow
                ideaId={selectedIdeaId as string}
                projectId={projectId}
                insideModal={false}
                compact={true}
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
