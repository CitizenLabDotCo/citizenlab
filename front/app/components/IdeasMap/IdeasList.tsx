import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaMapCard from './IdeaMapCard';
import IdeaButton from 'components/IdeaButton';

// hooks
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';
import T from 'components/T';

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
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
}

const IdeasList = memo<Props>(({ projectIds, phaseId, className }) => {
  const ideaMarkers = useIdeaMarkers({ phaseId, projectIds });

  if (!isNilOrError(ideaMarkers)) {
    return (
      <Container className={className || ''}>
        {ideaMarkers
          ?.filter((ideaMarker) => ideaMarker.attributes.location_point_geojson)
          ?.map((ideaMarker) => (
            <IdeaMapCard ideaId={ideaMarker.id} />
          ))}
      </Container>
    );
  }

  return null;
});

export default IdeasList;
