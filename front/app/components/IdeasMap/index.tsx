import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// events
import { selectedIdeaId$ } from './events';

// components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaButton from 'components/IdeaButton';
import IdeasList from './IdeasList';
import IdeasShow from 'containers/IdeasShow';

// hooks
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// styling
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';

const mapBorderPadding = 80;

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
`;

const IdeaButtonWrapper = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const MapOverlay = styled.div`
  width: 500px;
  position: absolute;
  display: flex;
  top: 50px;
  bottom: 200px;
  left: 50px;
  overflow-x: auto;
  background: #fff;
  ${defaultCardStyle};
  z-index: 900;
`;

const StyledIdeasShow = styled(IdeasShow)``;

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
    const phase = usePhase(phaseId || null);
    const ideaMarkers = useIdeaMarkers({ phaseId, projectIds });
    const { windowWidth } = useWindowSize();

    const containerRef = useRef<HTMLDivElement | null>(null);
    const ideaButtonRef = useRef<HTMLDivElement | null>(null);

    const [points, setPoints] = useState<Point[]>([]);
    const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
    const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
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

    useEffect(() => {
      const subscription = selectedIdeaId$.subscribe(
        ({ eventValue: ideaId }) => {
          setSelectedIdeaId(ideaId);
        }
      );

      return () => subscription.unsubscribe();
    }, []);

    const toggleIdea = (ideaId: string) => {
      trackEventByName(tracks.clickOnIdeaMapMarker, { extra: { ideaId } });
      setSelectedIdeaId((selectedIdeaId) =>
        ideaId !== selectedIdeaId ? ideaId : null
      );
    };

    const deselectIdea = () => {
      setSelectedIdeaId(null);
    };

    const onMapClick = (map: LeafletMap, position: LatLng) => {
      setSelectedLatLng(position);

      const ideaPostingEnabled =
        (!isNilOrError(project) && project.attributes.posting_enabled) ||
        (!isNilOrError(phase) && phase.attributes.posting_enabled);

      if (ideaPostingEnabled && ideaButtonRef?.current) {
        popup()
          .setLatLng(position)
          .setContent(ideaButtonRef?.current)
          .openOn(map);
      }

      return;
    };

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
              onMarkerClick={toggleIdea}
              onMapClick={onMapClick}
              fitBounds={false}
              mapHeight="80vh"
              onBoxClose={deselectIdea}
            />

            <MapOverlay>
              {!selectedIdeaId ? (
                <IdeasList projectIds={projectIds} phaseId={phaseId} />
              ) : (
                <StyledIdeasShow
                  ideaId={selectedIdeaId}
                  projectId={project.id}
                  insideModal={false}
                  compact={true}
                />
              )}
            </MapOverlay>

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
          </InnerContainer>
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(IdeasMap);
