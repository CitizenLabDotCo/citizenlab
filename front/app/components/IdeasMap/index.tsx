import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
// import { LatLng } from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
// import IdeaButton from 'components/IdeaButton';
import IdeaMapOverlay from './IdeaMapOverlay';

// hooks
import useProject from 'hooks/useProject';
// import usePhase from 'hooks/usePhase';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useWindowSize from 'hooks/useWindowSize';

// events
import { setIdeaMapCardSelected, ideaMapCardSelected$ } from './events';
import {
  setLeafletMapSelectedMarker,
  leafletMapSelectedMarker$,
} from 'components/UI/LeafletMap/events';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

const mapBorderPadding = 60;

const Container = styled.div``;

const InnerContainer = styled.div<{ leftMargin: number | null }>`
  width: ${({ leftMargin }) =>
    leftMargin ? `calc(100vw - ${mapBorderPadding * 2}px)` : '100%'};
  margin-left: ${({ leftMargin }) =>
    leftMargin ? `-${leftMargin}px` : 'auto'};
  position: relative;

  > .create-idea-wrapper {
    display: none;
  }

  /* border: solid 2px green; */

  .activeArea {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 500px;
    /* z-index: 99999; */
    /* border: solid 2px red; */
  }
`;

// const IdeaButtonWrapper = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const StyledIdeaMapOverlay = styled(IdeaMapOverlay)`
  width: 400px;
  height: calc(80vh - 30px);
  position: absolute;
  display: flex;
  top: 15px;
  left: 15px;
  z-index: 900;
`;

interface Props {
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
}

const getInnerContainerLeftMargin = (
  windowWidth: number,
  containerWidth: number
) => {
  const leftMargin =
    Math.round((windowWidth - containerWidth) / 2) - mapBorderPadding;
  return leftMargin > 0 ? leftMargin : null;
};

const initialWindowWidth = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);
const initialContainerWidth =
  document?.getElementById('e2e-ideas-container')?.offsetWidth ||
  (initialWindowWidth < maxPageWidth ? initialWindowWidth - 40 : maxPageWidth);
const initialInnerContainerLeftMargin = getInnerContainerLeftMargin(
  initialWindowWidth,
  initialContainerWidth
);

const IdeasMap = memo<Props & WithRouterProps>(
  ({ projectIds, phaseId, params, className }) => {
    const project = useProject({ projectSlug: params.slug });
    const ideaMarkers = useIdeaMarkers({ phaseId, projectIds, sort: '-new' });
    const { windowWidth } = useWindowSize();

    const containerRef = useRef<HTMLDivElement | null>(null);
    // const ideaButtonRef = useRef<HTMLDivElement | null>(null);

    const [points, setPoints] = useState<Point[]>([]);
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
    const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
      initialInnerContainerLeftMargin
    );

    useLayoutEffect(() => {
      const containerWidth = containerRef.current
        ?.getBoundingClientRect()
        .toJSON()?.width;

      if (containerWidth) {
        setContainerWidth(containerWidth);
      }
    });

    useEffect(() => {
      const subscriptions = [
        ideaMapCardSelected$.subscribe((selectedIdeaId) => {
          setLeafletMapSelectedMarker(selectedIdeaId);
        }),
        leafletMapSelectedMarker$.subscribe((selectedIdeaId) => {
          if (selectedIdeaId) {
            trackEventByName(tracks.clickOnIdeaMapMarker, {
              extra: { selectedIdeaId },
            });
          }
          setIdeaMapCardSelected(selectedIdeaId);
        }),
      ];

      return () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
      };
    }, []);

    useEffect(() => {
      setInnerContainerLeftMargin(
        getInnerContainerLeftMargin(windowWidth, containerWidth)
      );
    }, [windowWidth, containerWidth]);

    useEffect(() => {
      const ideaPoints: Point[] = [];

      if (!isNilOrError(ideaMarkers) && ideaMarkers.length > 0) {
        ideaMarkers.forEach((ideaMarker) => {
          if (
            ideaMarker.attributes &&
            ideaMarker.attributes.location_point_geojson
          ) {
            ideaPoints.push({
              ...ideaMarker.attributes.location_point_geojson,
              id: ideaMarker.id,
            });
          }
        });
      }

      setPoints(ideaPoints);
    }, [ideaMarkers]);

    // const handleOnMapClick = (map: LeafletMap, position: LatLng) => {
    //   setSelectedLatLng(position);

    //   const ideaPostingEnabled =
    //     (!isNilOrError(project) && project.attributes.posting_enabled) ||
    //     (!isNilOrError(phase) && phase.attributes.posting_enabled);

    //   if (ideaPostingEnabled && ideaButtonRef?.current) {
    //     popup()
    //       .setLatLng(position)
    //       .setContent(ideaButtonRef?.current)
    //       .openOn(map);
    //   }

    //   return;
    // };

    if (!isNilOrError(project)) {
      return (
        <Container ref={containerRef} className={className || ''}>
          <InnerContainer leftMargin={innerContainerLeftMargin}>
            {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 && (
              <StyledWarning
                text={<FormattedMessage {...messages.nothingOnMapWarning} />}
              />
            )}

            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_mapTitle} />
            </ScreenReaderOnly>

            <Map
              projectId={project.id}
              points={points}
              mapHeight="80vh"
              noMarkerClustering={true}
              zoomControlPosition="topright"
              layersControlPosition="bottomright"
            />

            {projectIds && !isNilOrError(project) && (
              <StyledIdeaMapOverlay
                projectIds={projectIds}
                projectId={project?.id}
                phaseId={phaseId}
              />
            )}

            {/*
            <IdeaButtonWrapper
              className="create-idea-wrapper"
              ref={ideaButtonRef}
            >
              <IdeaButton
                projectId={project.id}
                phaseId={phaseId || undefined}
                participationContextType={phaseId ? 'phase' : 'project'}
                latLng={selectedLatLng}
                inMap={true}
              />
            </IdeaButtonWrapper>
            */}
          </InnerContainer>
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(IdeasMap);
