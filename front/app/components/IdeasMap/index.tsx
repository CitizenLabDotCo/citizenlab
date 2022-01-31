import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
import { CSSTransition } from 'react-transition-group';

// components
import Map, { Point } from 'components/Map';
import IdeaButton from 'components/IdeaButton';
import DesktopIdeaMapOverlay from './desktop/IdeaMapOverlay';
import IdeaMapCard from './IdeaMapCard';
import { Icon, useWindowSize } from '@citizenlab/cl2-component-library';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useIdeaMarkers from 'hooks/useIdeaMarkers';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';
import { getIdeaPostingRules } from 'services/actionTakingRules';

// events
import {
  setIdeaMapCardSelected,
  setIdeasSearch,
  setIdeasSort,
  setIdeasTopics,
  ideaMapCardSelected$,
  ideasSearch$,
  ideasTopics$,
} from './events';
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

// typings
import { Sort } from 'resources/GetIdeas';
import { IIdeaMarkerData } from 'services/ideas';

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
    background: ${colors.backgroundLightGrey};
  }

  ${media.biggerThanMaxTablet`
    & .leaflet-control-zoom {
      margin-top: ${(props) =>
        props.isPostingEnabled ? '78px' : '25px'} !important;
      margin-right: 14px !important;
    }

    & .leaflet-control-layers {
      margin-right: 15px !important;
    }
  `}

  ${media.smallerThanMaxTablet`
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

  ${media.smallerThanMaxTablet`
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
  fill: ${colors.clBlueDarker};
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-right: 8px;
`;

const InfoOverlayText = styled.text`
  color: ${colors.clBlueDarker};
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

  ${media.smallerThanMaxTablet`
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
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
  id?: string;
  ariaLabelledBy?: string;
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

const IdeasMap = memo<Props>(
  ({ projectIds, phaseId, className, id, ariaLabelledBy }) => {
    const authUser = useAuthUser();
    const project = useProject({ projectId: projectIds?.[0] });
    const phase = usePhase(phaseId || null);
    const { windowWidth } = useWindowSize();
    const smallerThanMaxTablet = windowWidth <= viewportWidths.largeTablet;

    const isPBProject =
      phase === null &&
      !isNilOrError(project) &&
      project.attributes.participation_method === 'budgeting';
    const isPBPhase =
      !isNilOrError(phase) &&
      phase.attributes.participation_method === 'budgeting';
    const isPBIdea = isNilOrError(phase) ? isPBProject : isPBPhase;

    // refs
    const containerRef = useRef<HTMLDivElement | null>(null);
    const ideaButtonWrapperRef = useRef<HTMLDivElement | null>(null);

    // state
    const [map, setMap] = useState<LeafletMap | null>(null);
    const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
    const [selectedIdeaMarkerId, setSelectedIdeaMarkerId] = useState<
      string | null
    >(null);
    const [points, setPoints] = useState<Point[]>([]);
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
    const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
      initialInnerContainerLeftMargin
    );
    const [isCardClickable, setIsCardClickable] = useState(false);

    // ideaMarkers
    const defaultIdeasSearch: string | null = null;
    const defaultIdeasSort: Sort =
      project?.attributes.ideas_order || ideaDefaultSortMethodFallback;
    const defaultIdeasTopics: string[] = [];
    const [search, setSearch] = useState<string | null>(defaultIdeasSearch);
    const [topics, setTopics] = useState<string[]>(defaultIdeasTopics);
    const ideaMarkers = useIdeaMarkers({
      projectIds,
      phaseId,
      search,
      topics,
    });

    const ideaPostingRules = getIdeaPostingRules({
      project,
      phase,
      authUser,
    });

    const isIdeaPostingEnabled =
      ideaPostingRules.show && ideaPostingRules.enabled === true;

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        ideaMapCardSelected$.subscribe((ideaId) => {
          setLeafletMapSelectedMarker(ideaId);
          setSelectedIdeaMarkerId(ideaId);
        }),
        leafletMapSelectedMarker$.subscribe((ideaId) => {
          setIdeaMapCardSelected(ideaId);
          setSelectedIdeaMarkerId((_prevIdeaIdideaId) => {
            // temporarily disable pointer events on the mobile ideacard popup to avoid
            // the marker click event from propagating to the card that migth pop up on top of it
            setIsCardClickable(false);
            setTimeout(() => {
              setIsCardClickable(true);
            }, 200);
            return ideaId;
          });
        }),
        leafletMapClicked$.subscribe((latLng) => {
          setSelectedLatLng(latLng);
        }),
        ideasSearch$.subscribe((search) => {
          setSearch(search);
        }),
        ideasTopics$.subscribe((topics) => {
          setTopics(topics);
        }),
      ];

      // defaults
      setIdeasSearch(defaultIdeasSearch);
      setIdeasSort(defaultIdeasSort);
      setIdeasTopics(defaultIdeasTopics);

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
    }, [windowWidth, containerWidth, smallerThanMaxTablet]);

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

    const handleMapOnInit = (map: LeafletMap) => {
      setMap(map);
    };

    const handleIdeaMapCardOnClose = () => {
      setIdeaMapCardSelected(null);
      setLeafletMapSelectedMarker(null);
      setLeafletMapHoveredMarker(null);
    };

    const selectedIdeaMarker = useMemo(() => {
      return ideaMarkers?.find(({ id }) => id === selectedIdeaMarkerId);
    }, [ideaMarkers, selectedIdeaMarkerId]);

    if (!isNilOrError(project)) {
      const projectId = project.id;
      return (
        <Container
          ref={containerRef}
          className={className || ''}
          id={id}
          aria-labelledby={ariaLabelledBy}
        >
          <InnerContainer
            leftMargin={innerContainerLeftMargin}
            isPostingEnabled={isIdeaPostingEnabled}
          >
            {isIdeaPostingEnabled && (
              <InfoOverlay>
                <InfoOverlayInner>
                  <InfoOverlayIcon name="info" />
                  <InfoOverlayText>
                    <FormattedMessage
                      {...(smallerThanMaxTablet
                        ? messages.tapOnMapToAdd
                        : messages.clickOnMapToAdd)}
                    />
                  </InfoOverlayText>
                </InfoOverlayInner>
              </InfoOverlay>
            )}

            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_mapTitle} />
            </ScreenReaderOnly>

            {smallerThanMaxTablet && (
              <CSSTransition
                classNames="animation"
                in={!!selectedIdeaMarker}
                timeout={300}
              >
                <StyledIdeaMapCard
                  ideaMarker={selectedIdeaMarker as IIdeaMarkerData}
                  isPBIdea={isPBIdea}
                  onClose={handleIdeaMapCardOnClose}
                  isClickable={isCardClickable}
                  projectId={projectId}
                />
              </CSSTransition>
            )}

            <Map
              onInit={handleMapOnInit}
              projectId={projectId}
              points={points}
              mapHeight={
                smallerThanMaxTablet ? mapHeightMobile : mapHeightDesktop
              }
              noMarkerClustering={false}
              zoomControlPosition={
                smallerThanMaxTablet ? 'topleft' : 'topright'
              }
              layersControlPosition={
                smallerThanMaxTablet ? 'topright' : 'bottomright'
              }
            />

            {projectIds && !isNilOrError(project) && (
              <StyledDesktopIdeaMapOverlay
                projectIds={projectIds}
                projectId={project?.id}
                phaseId={phaseId}
              />
            )}

            <IdeaButtonWrapper
              className="create-idea-wrapper"
              ref={ideaButtonWrapperRef}
            >
              <IdeaButton
                projectId={projectId}
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
    // add EmptyIdeas

    return null;
  }
);

export default IdeasMap;
