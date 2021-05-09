import React, { memo, useState, useEffect, useRef } from 'react';
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
  display: flex;
  flex-direction: column;
  background: #fff;
  ${defaultCardStyle};
`;

const ScrollContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
`;

const StyledIdeaShowPageTopBar = styled(IdeaShowPageTopBar)``;

const StyledIdeasShow = styled(IdeasShow)`
  padding: 30px;
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

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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
          {selectedIdeaId && (
            <StyledIdeaShowPageTopBar
              ideaId={selectedIdeaId}
              goBackAction={goBack}
            />
          )}
          <ScrollContainer ref={scrollContainerRef}>
            {!selectedIdeaId ? (
              <IdeasList
                type="load-more"
                projectIds={projectIds}
                participationMethod={project.attributes.participation_method}
                participationContextId={projectId}
                participationContextType="project"
                defaultSortingMethod={project.attributes.ideas_order || null}
              />
            ) : (
              <StyledIdeasShow
                ideaId={selectedIdeaId}
                projectId={projectId}
                insideModal={false}
                compact={true}
              />
            )}
          </ScrollContainer>
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapOverlay;
