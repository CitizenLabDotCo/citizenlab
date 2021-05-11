import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// events
import { ideaMapCardSelected$, setIdeaMapCardSelected } from './events';

// hooks
import useProject from 'hooks/useProject';

// components
import IdeasList from './IdeasList';
import IdeasShow from 'containers/IdeasShow';
import IdeaShowPageTopBar from 'containers/IdeasShowPage/IdeaShowPageTopBar';

// styling
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

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
  right: -100px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${defaultCardStyle};
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

    // const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      // scrollContainerRef.current?.addEventListener('wheel', scrolling);

      const subscription = ideaMapCardSelected$.subscribe((ideaId) => {
        setSelectedIdeaId(ideaId);
      });

      return () => {
        subscription.unsubscribe();
        // scrollContainerRef.current?.removeEventListener('wheel', scrolling);
      };
    }, []);

    // const scrolling = (event: WheelEvent) => {
    //   // prevent body from scrolling
    //   if (scrollContainerRef.current) {
    //     const deltaY = event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY;
    //     scrollContainerRef.current.scrollTop += deltaY;
    //     event.preventDefault();
    //   }
    // };

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

          {selectedIdeaId && (
            <InnerOverlay>
              <StyledIdeaShowPageTopBar
                ideaId={selectedIdeaId}
                goBackAction={goBack}
              />
              <StyledIdeasShow
                ideaId={selectedIdeaId}
                projectId={projectId}
                insideModal={false}
                compact={true}
              />
            </InnerOverlay>
          )}
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapOverlay;
