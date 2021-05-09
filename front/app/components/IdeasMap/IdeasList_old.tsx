import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaMapCard from './IdeaMapCard';

// hooks
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useProject from 'hooks/useProject';

// styling
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
`;

interface Props {
  projectId?: string | null;
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
}

const IdeasList = memo<Props>(
  ({ projectIds, projectId, phaseId, className }) => {
    const ideaMarkers = useIdeaMarkers({ phaseId, projectIds });
    const project = useProject({ projectId });

    if (
      !isNilOrError(ideaMarkers) &&
      !isNilOrError(project) &&
      projectIds &&
      projectIds?.length > 0
    ) {
      return (
        <Container className={className || ''}>
          {ideaMarkers
            ?.filter(
              (ideaMarker) => ideaMarker.attributes.location_point_geojson
            )
            ?.map((ideaMarker) => (
              <IdeaMapCard ideaId={ideaMarker.id} />
            ))}
        </Container>
      );
    }

    return null;
  }
);

export default IdeasList;
