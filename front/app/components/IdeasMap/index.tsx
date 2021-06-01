import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { popup, LatLng } from 'leaflet';
import CSSTransition from 'react-transition-group/CSSTransition';

// components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaButton from 'components/IdeaButton';
import DesktopIdeaMapOverlay from './desktop/IdeaMapOverlay';
import IdeaMapCard from './IdeaMapCard';

// hooks
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useWindowSize from 'hooks/useWindowSize';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

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
import { media, viewportWidths } from 'utils/styleUtils';

// typings
import { Sort } from 'resources/GetIdeas';

const mapMarginDesktop = 70;
const mapHeightDesktop = '85vh';
const mapHeightMobile = '75vh';

const Container = styled.div``;

const InnerContainer = styled.div<{ leftMargin: number | null }>`
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

  ${media.smallerThanMaxTablet`
    .activeArea {
      left: 0px;
    }
  `}
`;

// const StyledMap = styled(Map)`
//   border: none;
//   background: transparent;
//   box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 0.15);
// `;

const IdeaButtonWrapper = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const StyledDesktopIdeaMapOverlay = styled(DesktopIdeaMapOverlay)`
  width: 400px;
  height: calc(${mapHeightDesktop} - 45px);
  position: absolute;
  display: flex;
  top: 20px;
  left: 20px;
  z-index: 900;
`;

const MobileIdeaMapCard = styled.div<{ isClickable: boolean }>`
  position: absolute;
  top: calc(${mapHeightMobile} - 130px - 20px);
  left: 10px;
  right: 10px;
  z-index: 1000;
  transition: all 300ms cubic-bezier(0.19, 1, 0.22, 1);
  pointer-events: ${(props) => (props.isClickable ? 'auto' : 'none')};

  &.animation-enter {
    top: calc(${mapHeightMobile} - 130px);

    &.animation-enter-active {
      top: calc(${mapHeightMobile} - 130px - 20px);
    }
  }
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

const IdeasMap = memo<Props>(({ projectIds, phaseId, className }) => {
  const project = useProject({ projectId: projectIds?.[0] });
  const phase = usePhase(phaseId || null);
  const { windowWidth } = useWindowSize();
  const smallerThanMaxTablet = windowWidth <= viewportWidths.largeTablet;

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ideaButtonRef = useRef<HTMLDivElement | null>(null);

  // state
  const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
  const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
    initialInnerContainerLeftMargin
  );
  const [isMobileCardClickable, setIsMobileCardClickable] = useState(false);

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
        setSelectedIdeaId(ideaId);
      }),
      leafletMapSelectedMarker$.subscribe((ideaId) => {
        setIdeaMapCardSelected(ideaId);
        setSelectedIdeaId((_prevIdeaIdideaId) => {
          // temporarily disable pointer events on the mobile ideacard popup to avoid
          // the marker click event from propagating to the card
          setIsMobileCardClickable(false);
          setTimeout(() => {
            setIsMobileCardClickable(true);
          }, 200);
          return ideaId;
        });
      }),
      leafletMapClicked$.subscribe(({ map, latLng }) => {
        const ideaPostingEnabled =
          (!isNilOrError(project) && project.attributes.posting_enabled) ||
          (!isNilOrError(phase) && phase.attributes.posting_enabled);

        if (ideaPostingEnabled && map && latLng && ideaButtonRef?.current) {
          setSelectedLatLng(latLng);
          popup()
            .setLatLng(latLng)
            .setContent(ideaButtonRef.current)
            .openOn(map);
        }
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
  }, [project, phase]);

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

  const handleIdeaMapCardOnClose = () => {
    setIdeaMapCardSelected(null);
    setLeafletMapSelectedMarker(null);
    setLeafletMapHoveredMarker(null);
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
            mapHeight={
              smallerThanMaxTablet ? mapHeightMobile : mapHeightDesktop
            }
            noMarkerClustering={false}
            zoomControlPosition={smallerThanMaxTablet ? 'topleft' : 'topright'}
            layersControlPosition="topright"
          />

          {!smallerThanMaxTablet && projectIds && !isNilOrError(project) && (
            <StyledDesktopIdeaMapOverlay
              projectIds={projectIds}
              projectId={project?.id}
              phaseId={phaseId}
            />
          )}

          <CSSTransition
            classNames="animation"
            in={!!(smallerThanMaxTablet && selectedIdeaId)}
            timeout={300}
            mounOnEnter={true}
            unmountOnExit={true}
            enter={true}
            exit={true}
          >
            <MobileIdeaMapCard
              className="animation"
              isClickable={isMobileCardClickable}
            >
              <IdeaMapCard
                ideaId={selectedIdeaId as string}
                onClose={handleIdeaMapCardOnClose}
              />
            </MobileIdeaMapCard>
          </CSSTransition>

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
});

export default IdeasMap;
