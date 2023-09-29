import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { popup, LatLng, Map as LeafletMap, LatLngTuple } from 'leaflet';
import { CSSTransition } from 'react-transition-group';

// components
import Map, { Point } from 'components/Map';
import IdeaButton from 'components/IdeaButton';
import DesktopIdeaMapOverlay from './desktop/IdeaMapOverlay';
import IdeaMapCard from './IdeaMapCard';
import { Icon, useWindowSize } from '@citizenlab/cl2-component-library';

// hooks
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useAuthUser from 'api/me/useAuthUser';

// router
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// events
import {
  setLeafletMapSelectedMarker,
  setLeafletMapHoveredMarker,
  leafletMapSelectedMarker$,
  leafletMapClicked$,
} from 'components/UI/LeafletMap/events';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import { media, viewportWidths, colors, fontSizes } from 'utils/styleUtils';

// utils
import { isAdmin, isProjectModerator } from 'utils/permissions/roles';

// typings
import { IIdeaMarkerData } from 'api/idea_markers/types';

const mapMarginDesktop = 70;
const mapHeightDesktop = '83vh';
const mapHeightMobile = '78vh';

const Container = styled.div``;

const InnerContainer = styled.div<{
  leftMargin: number | null;
  isPostingEnabled: boolean;
}>`
  width: ${({ leftMargin }) =>
    leftMargin ? `calc(100vw - ${mapMarginDesktop * 2}px)` : '100%'};
  margin-left: ${({ leftMargin }) =>
    leftMargin ? `-${leftMargin}px` : 'auto'};
  position: relative;

  @media screen and (min-width: 2000px) {
    width: 1800px;
    margin-left: -${(1800 - maxPageWidth) / 2}px;
  }

  > .create-idea-wrapper {
    display: none;
  }

  .activeArea {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 500px;
  }

  & .pbAssignBudgetControlContainer {
    padding: 20px;
    background: ${colors.background};
  }

  ${(props) =>
    media.desktop`
    & .leaflet-control-zoom {
      margin-top: ${props.isPostingEnabled ? '78px' : '25px'} !important;
      margin-right: 14px !important;
    }

    & .leaflet-control-layers {
      margin-right: 15px !important;
    }
  `}

  ${media.tablet`
    .activeArea {
      left: 0px;
    }
  `}
`;

const InfoOverlay = styled.div`
  position: absolute;
  top: 25px;
  right: 15px;
  z-index: 900;

  ${media.tablet`
    width: calc(100% - 40px);
    top: calc(${mapHeightMobile} - 72px);
    right: 20px;
  `}
`;

const InfoOverlayInner = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 17px;
  border-radius: 3px;
  background: #e1f0f4;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const InfoOverlayIcon = styled(Icon)`
  fill: ${colors.teal700};
  flex: 0 0 24px;
  margin-right: 8px;
`;

const InfoOverlayText = styled.p`
  color: ${colors.teal700};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: normal;
`;

const IdeaButtonWrapper = styled.div``;

const StyledDesktopIdeaMapOverlay = styled(DesktopIdeaMapOverlay)`
  width: 390px;
  height: calc(${mapHeightDesktop} - 50px);
  position: absolute;
  display: flex;
  top: 25px;
  left: 25px;
  z-index: 900;

  ${media.tablet`
    display: none;
  `}
`;

const StyledIdeaMapCard = styled(IdeaMapCard)<{ isClickable: boolean }>`
  width: calc(100% - 24px);
  position: absolute;
  top: calc(${mapHeightMobile} - 130px - 24px);
  left: 12px;
  right: 12px;
  z-index: 1001;
  pointer-events: ${(props) => (props.isClickable ? 'auto' : 'none')};
  transition: opacity 300ms cubic-bezier(0.19, 1, 0.22, 1),
    top 300ms cubic-bezier(0.19, 1, 0.22, 1);

  &.animation-enter {
    opacity: 0;
    top: calc(${mapHeightMobile} - 130px);

    &.animation-enter-active {
      opacity: 1;
      top: calc(${mapHeightMobile} - 130px - 24px);
    }
  }
`;

interface Props {
  projectId: string;
  phaseId?: string;
  className?: string;
  id?: string;
  ariaLabelledBy?: string;
  tabIndex?: number;
}

const getInnerContainerLeftMargin = (
  windowWidth: number,
  containerWidth: number
) => {
  const leftMargin =
    Math.round((windowWidth - containerWidth) / 2) - mapMarginDesktop;
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

const IdeasMap = memo<Props>((props) => {
  const { projectId, phaseId, className, id, ariaLabelledBy, tabIndex } = props;
  const [searchParams] = useSearchParams();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);
  const { windowWidth } = useWindowSize();
  const tablet = windowWidth <= viewportWidths.tablet;
  const { data: authUser } = useAuthUser();

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ideaButtonWrapperRef = useRef<HTMLDivElement | null>(null);

  // state
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
  const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
  const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
    initialInnerContainerLeftMargin
  );
  const [isCardClickable, setIsCardClickable] = useState(true);
  const [initialMapCenter, setInitialMapCenter] = useState<
    LatLngTuple | undefined
  >(undefined);

  // ideaMarkers
  const selectedIdeaMarkerId = searchParams.get('idea_map_id');
  const search = searchParams.get('search');
  const topicsParam = searchParams.get('topics');
  const topics: string[] = topicsParam ? JSON.parse(topicsParam) : [];

  const [initiallySelectedMarkerId, setInitiallySelectedMarkerId] = useState<
    string | null
  >(selectedIdeaMarkerId);

  const { data: ideaMarkers } = useIdeaMarkers({
    projectIds: [projectId],
    phaseId,
    search,
    topics,
  });

  const ideaPostingActionDescriptor =
    project?.data.attributes.action_descriptor.posting_idea;

  const isAdminOrModerator = authUser
    ? isAdmin(authUser) || isProjectModerator(authUser)
    : false;

  const isIdeaPostingEnabled =
    ideaPostingActionDescriptor?.enabled === true || isAdminOrModerator;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const newContainerWidth = containerRef.current
      ?.getBoundingClientRect()
      .toJSON()?.width;

    if (newContainerWidth && newContainerWidth !== containerWidth) {
      setContainerWidth(newContainerWidth);
    }
  });

  useEffect(() => {
    const subscriptions = [
      leafletMapSelectedMarker$.subscribe((ideaId) => {
        // temporarily disable pointer events on the mobile ideacard popup to avoid
        // the marker click event from propagating to the card that migth pop up on top of it
        setIsCardClickable(false);
        setTimeout(() => {
          setIsCardClickable(true);
        }, 200);

        updateSearchParams({ idea_map_id: ideaId });
      }),
      leafletMapClicked$.subscribe((latLng) => {
        setSelectedLatLng(latLng);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, phase]);

  useEffect(() => {
    if (
      map &&
      selectedLatLng &&
      isIdeaPostingEnabled &&
      ideaButtonWrapperRef?.current
    ) {
      popup({ closeButton: true })
        .setLatLng(selectedLatLng)
        .setContent(ideaButtonWrapperRef.current)
        .openOn(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedLatLng]);

  useEffect(() => {
    setInnerContainerLeftMargin(
      getInnerContainerLeftMargin(windowWidth, containerWidth)
    );
  }, [windowWidth, containerWidth, tablet]);

  const points = useMemo(() => {
    if (!isNilOrError(ideaMarkers) && ideaMarkers.data.length > 0) {
      const ideaPoints: Point[] = [];

      ideaMarkers.data.forEach((ideaMarker) => {
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

      return ideaPoints;
    }

    return;
  }, [ideaMarkers]);

  const handleMapOnInit = (map: LeafletMap) => {
    setMap(map);
  };

  const deselectIdeaMarker = () => {
    updateSearchParams({ idea_map_id: null });
    setLeafletMapSelectedMarker(null);
    setLeafletMapHoveredMarker(null);
  };

  const selectedIdeaMarker = useMemo(() => {
    return ideaMarkers?.data.find(({ id }) => id === selectedIdeaMarkerId);
  }, [ideaMarkers, selectedIdeaMarkerId]);

  useEffect(() => {
    if (!initiallySelectedMarkerId || initialMapCenter) return;
    const point = selectedIdeaMarker?.attributes.location_point_geojson;

    if (!point) {
      // For whatever reason, ideaMarkers also includes ideas without
      // markers. If the search params contain one of those,
      // we do nothing
      setInitiallySelectedMarkerId(null);
      return;
    }

    const { coordinates } = point;
    setInitialMapCenter([coordinates[1], coordinates[0]]);
  }, [initiallySelectedMarkerId, initialMapCenter, selectedIdeaMarker]);

  if (initiallySelectedMarkerId && !initialMapCenter) {
    return null;
  }

  return (
    <Container
      ref={containerRef}
      className={className || ''}
      id={id}
      aria-labelledby={ariaLabelledBy}
      tabIndex={tabIndex}
    >
      <InnerContainer
        leftMargin={innerContainerLeftMargin}
        isPostingEnabled={isIdeaPostingEnabled}
      >
        {isIdeaPostingEnabled && (
          <InfoOverlay>
            <InfoOverlayInner>
              <InfoOverlayIcon name="info-outline" />
              <InfoOverlayText>
                {!isAdminOrModerator ? (
                  <FormattedMessage
                    {...(tablet
                      ? messages.tapOnMapToAdd
                      : messages.clickOnMapToAdd)}
                  />
                ) : (
                  <FormattedMessage
                    {...(tablet
                      ? messages.tapOnMapToAddAdmin
                      : messages.clickOnMapToAddAdmin)}
                  />
                )}
              </InfoOverlayText>
            </InfoOverlayInner>
          </InfoOverlay>
        )}

        <ScreenReaderOnly>
          <FormattedMessage {...messages.a11y_mapTitle} />
        </ScreenReaderOnly>

        {tablet && (
          <CSSTransition
            classNames="animation"
            in={!!selectedIdeaMarker}
            timeout={300}
          >
            <StyledIdeaMapCard
              ideaMarker={selectedIdeaMarker as IIdeaMarkerData}
              onClose={deselectIdeaMarker}
              isClickable={isCardClickable}
              projectId={projectId}
              phaseId={phaseId}
            />
          </CSSTransition>
        )}

        <Map
          initialSelectedPointId={initiallySelectedMarkerId ?? undefined}
          centerLatLng={initialMapCenter}
          onInit={handleMapOnInit}
          projectId={projectId}
          points={points}
          mapHeight={tablet ? mapHeightMobile : mapHeightDesktop}
          noMarkerClustering={false}
          zoomControlPosition={tablet ? 'topleft' : 'topright'}
          layersControlPosition={tablet ? 'topright' : 'bottomright'}
        />

        <StyledDesktopIdeaMapOverlay
          projectId={projectId}
          phaseId={phaseId}
          deselectIdeaMarker={deselectIdeaMarker}
        />

        <IdeaButtonWrapper
          className="create-idea-wrapper"
          ref={ideaButtonWrapperRef}
        >
          <IdeaButton
            projectId={projectId}
            participationContextType={phaseId ? 'phase' : 'project'}
            latLng={selectedLatLng}
            inMap={true}
            phase={phase?.data}
            participationMethod="ideation"
          />
        </IdeaButtonWrapper>
      </InnerContainer>
    </Container>
  );
});

export default IdeasMap;
