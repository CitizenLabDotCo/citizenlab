/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Point from '@arcgis/core/geometry/Point';
import Graphic from '@arcgis/core/Graphic';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  colors,
  useBreakpoint,
  useWindowSize,
  viewportWidths,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import styled, { useTheme } from 'styled-components';

import { IIdeaMarkers } from 'api/idea_markers/types';
import { IMapConfig } from 'api/map_config/types';
import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import LayerHoverLabel from 'components/ConfigurationMap/components/LayerHoverLabel';
import EsriMap from 'components/EsriMap';
import {
  getClusterConfiguration,
  showAddInputPopup,
  goToMapLocation,
  esriPointToGeoJson,
  changeCursorOnHover,
  parseLayers,
  getShapeSymbol,
} from 'components/EsriMap/utils';
import { InputFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar/InputFilters';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { projectPointToWebMercator } from 'utils/mapUtils/map';
import { isAdmin } from 'utils/permissions/roles';

import IdeaMapOverlay from './desktop/IdeaMapOverlay';
import IdeaMapCard from './IdeaMapCard';
import IdeasAtLocationPopup from './IdeasAtLocationPopup';
import InstructionMessage from './InstructionMessage';
import messages from './messages';
import StartIdeaButton from './StartIdeaButton';
import {
  InnerContainer,
  getInnerContainerLeftMargin,
  initialContainerWidth,
  initialInnerContainerLeftMargin,
  mapHeightDesktop,
  mapHeightMobile,
} from './utils';

// Note: Existing custom styling
const StyledIdeaMapCard = styled(IdeaMapCard)<{ isClickable: boolean }>`
  width: calc(100% - 24px);
  position: absolute;
  top: calc(${mapHeightMobile} - 220px - 24px);
  left: 12px;
  right: 12px;
  z-index: 1001;
  pointer-events: ${(props) => (props.isClickable ? 'auto' : 'none')};
  transition: opacity 300ms cubic-bezier(0.19, 1, 0.22, 1),
    top 300ms cubic-bezier(0.19, 1, 0.22, 1);

  &.animation-enter {
    opacity: 0;

    &.animation-enter-active {
      opacity: 1;
    }
  }
`;

// Custom styling for Esri map
const StyledMapContainer = styled(Box)`
  position: relative;

  .esri-popup__main-container {
    max-width: 300px !important;
  }
`;

export interface Props {
  projectId: string;
  phaseId?: string;
  mapConfig?: IMapConfig | null;
  ideaMarkers?: IIdeaMarkers;
  inputFiltersProps?: InputFiltersProps;
}

const IdeasMap = memo<Props>(
  ({
    projectId,
    phaseId,
    mapConfig,
    ideaMarkers,
    inputFiltersProps,
  }: Props) => {
    const theme = useTheme();
    const localize = useLocalize();
    const { formatMessage } = useIntl();
    const { data: phase } = usePhase(phaseId);
    const { data: authUser } = useAuthUser();
    const [searchParams] = useSearchParams();
    const isMobileOrSmaller = useBreakpoint('phone');
    const isTabletOrSmaller = useBreakpoint('tablet');

    // Create div elements to use for inserting React components into Esri map popup
    // Docs: https://developers.arcgis.com/javascript/latest/custom-ui/#introduction
    const startIdeaButtonNode = useMemo(() => {
      return document.createElement('div');
    }, []);
    const ideasAtLocationNode = useMemo(() => {
      return document.createElement('div');
    }, []);

    // Map state variables
    const [esriMapView, setEsriMapview] = useState<MapView | null>(null);
    const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
    const [clickedMapLocation, setClickedMapLocation] =
      useState<GeoJSON.Point | null>(null);

    const selectedIdeaId = searchParams.get('idea_map_id');

    const ideaData = ideaMarkers?.data.find(
      (idea) => idea.id === selectedIdeaId
    );

    const setSelectedIdea = useCallback((ideaId: string | null) => {
      if (ideaId) {
        updateSearchParams({ idea_map_id: ideaId });
      } else {
        removeSearchParams(['idea_map_id']);
      }
    }, []);

    const [ideasSharingLocation, setIdeasSharingLocation] = useState<
      string[] | null
    >(null);

    // Map icon for ideas
    const ideaIcon = useMemo(() => {
      return getShapeSymbol({
        shape: isTabletOrSmaller ? 'triangle' : 'circle',
        color: theme.colors.tenantPrimary,
        outlineColor: colors.white,
        outlineWidth: 2,
        sizeInPx: 18,
      });
    }, [theme.colors.tenantPrimary, isTabletOrSmaller]);

    const ideaIconSecondary = useMemo(() => {
      return getShapeSymbol({
        shape: isTabletOrSmaller ? 'triangle' : 'circle',
        color: theme.colors.tenantSecondary,
        outlineColor: colors.white,
        outlineWidth: 2,
        sizeInPx: 18,
      });
    }, [theme.colors.tenantSecondary, isTabletOrSmaller]);

    // Existing handling for dynamic container width
    const { windowWidth } = useWindowSize();
    const tablet = useMemo(() => {
      return windowWidth <= viewportWidths.tablet;
    }, [windowWidth]);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
    const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
      initialInnerContainerLeftMargin
    );

    useLayoutEffect(() => {
      const newContainerWidth = containerRef.current
        ?.getBoundingClientRect()
        .toJSON()?.width;

      if (newContainerWidth && newContainerWidth !== containerWidth) {
        setContainerWidth(newContainerWidth);
      }
    }, [containerWidth]);

    useEffect(() => {
      setInnerContainerLeftMargin(
        getInnerContainerLeftMargin(windowWidth, containerWidth)
      );
    }, [windowWidth, containerWidth, tablet]);

    // Create Esri layers from mapConfig layers
    const mapLayers = useMemo(() => {
      return parseLayers(mapConfig, localize);
    }, [mapConfig, localize]);

    // Create a point graphics layer for idea pins
    const graphics = useMemo(() => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const ideasWithLocations = ideaMarkers?.data?.filter(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (idea) => idea?.attributes?.location_point_geojson
      );
      return ideasWithLocations?.map((idea) => {
        const coordinates =
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          idea?.attributes?.location_point_geojson?.coordinates;
        return new Graphic({
          geometry: new Point({
            longitude: coordinates?.[0],
            latitude: coordinates?.[1],
          }),
          attributes: {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            ideaId: idea?.id,
          },
        });
      });
    }, [ideaMarkers]);

    // Create an Esri feature layer from the idea pin graphics
    const ideasLayer = useMemo(() => {
      if (graphics) {
        return new FeatureLayer({
          source: graphics, // Array of idea graphics
          title: formatMessage(messages.userInputs),
          id: 'ideasLayer',
          outFields: ['*'],
          objectIdField: 'ID',
          fields: [
            {
              name: 'ID',
              type: 'oid',
            },
            {
              name: 'ideaId', // From the graphics attributes
              type: 'string',
            },
          ],
          // Set the symbol used to render the graphics
          renderer: new Renderer({
            symbol: ideaIcon,
          }),
          legendEnabled: false,
          featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
          // Add a popup template which is used when multiple ideas share a single location
          popupTemplate: {
            title: formatMessage(messages.multipleInputsAtLocation),
            content: () => {
              return ideasAtLocationNode;
            },
          },
        });
      }
      return undefined;
    }, [
      formatMessage,
      graphics,
      ideasAtLocationNode,
      theme.colors.tenantPrimary,
      ideaIcon,
    ]);

    const layers = useMemo(() => {
      return ideasLayer ? [...mapLayers, ideasLayer] : mapLayers;
    }, [ideasLayer, mapLayers]);

    const onMapInit = useCallback(
      (mapView: MapView) => {
        // Save the esriMapView in state
        if (!esriMapView) {
          setEsriMapview(mapView);

          // If an idea was selected in the URL params, move map to that idea
          if (selectedIdeaId) {
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const point = ideaMarkers?.data?.find(
              (idea) => idea.id === selectedIdeaId
            )?.attributes.location_point_geojson;

            if (!point) return;

            setTimeout(() => {
              goToMapLocation(point, mapView);
            }, 1000);
          }
        }
      },
      [esriMapView, selectedIdeaId, ideaMarkers]
    );

    const onMapClick = useCallback(
      (event: any, mapView: MapView) => {
        const clickedPointProjected = projectPointToWebMercator(event.mapPoint);
        setClickedMapLocation(esriPointToGeoJson(clickedPointProjected));

        const ideaPostingEnabled =
          phase?.data.attributes.submission_enabled || isAdmin(authUser);

        const showSubmitPopup = () => {
          if (ideaPostingEnabled) {
            showAddInputPopup({
              event,
              mapView,
              setSelectedInput: setSelectedIdea,
              popupContentNode: startIdeaButtonNode,
              popupTitle: formatMessage(messages.submitIdea),
            });
          }
        };

        mapView.hitTest(event).then((result) => {
          // Find the first meaningful graphic hit (idea pin or cluster aggregate)
          const graphicHit = result.results.find(
            (el): el is __esri.GraphicHit =>
              el.type === 'graphic' &&
              (!!el.graphic.attributes?.ideaId ||
                !!el.graphic.attributes?.cluster_count)
          );

          if (!graphicHit?.mapPoint) {
            showSubmitPopup();
            return;
          }

          const { graphic, mapPoint } = graphicHit;
          const cluster_count = graphic.attributes?.cluster_count;
          const ideaId = graphic.attributes?.ideaId;

          // Clicked a cluster — zoom in
          if (cluster_count && cluster_count > 1) {
            goToMapLocation(
              esriPointToGeoJson(mapPoint),
              mapView,
              mapView.zoom + 3
            );
            return;
          }

          if (!ideaId) {
            showSubmitPopup();
            return;
          }

          // Collect overlapping idea IDs at this location
          const overlappingIdeaIds = result.results
            .filter(
              (el): el is __esri.GraphicHit =>
                el.type === 'graphic' && !!el.graphic?.attributes?.ideaId
            )
            .map((el) => el.graphic.attributes.ideaId);

          // Multiple overlapping ideas at same location — show selection popup
          if (overlappingIdeaIds.length > 1) {
            goToMapLocation(esriPointToGeoJson(mapPoint), mapView).then(() => {
              setIdeasSharingLocation(overlappingIdeaIds);
              mapView.openPopup({
                title: formatMessage(messages.multipleInputsAtLocation),
                content: ideasAtLocationNode,
                location: mapPoint,
              });
            });
            return;
          }

          // Single idea — select it and briefly highlight
          goToMapLocation(esriPointToGeoJson(mapPoint), mapView).then(() => {
            setSelectedIdea(ideaId);
            if (graphic.geometry?.type === 'point') {
              const highlight = new Graphic({
                geometry: graphic.geometry,
                symbol: ideaIconSecondary,
              });
              mapView.graphics.add(highlight);
              setTimeout(() => mapView.graphics.remove(highlight), 2000);
            }
          });
        });
      },
      [
        setSelectedIdea,
        authUser,
        phase?.data.attributes.submission_enabled,
        startIdeaButtonNode,
        formatMessage,
        ideaIconSecondary,
        ideasAtLocationNode,
      ]
    );

    const onMapHover = useCallback((event: any, mapView: MapView) => {
      // Change cursor to pointer on hover
      changeCursorOnHover(event, mapView);

      // If the user hovers over a map element, show the layer label
      mapView.hitTest(event).then((result) => {
        const elements = result.results; // These are map elements underneath our cursor
        if (elements.length > 0) {
          // User hovered over an element on the map
          const topElement = elements[0];
          if (topElement.type === 'graphic') {
            // Set the hovered layer id
            const customParameters =
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              topElement.layer && topElement.layer['customParameters'];
            setHoveredLayerId(customParameters?.layerId || null);
          }
        } else {
          setHoveredLayerId(null);
        }
      });
    }, []);

    const onSelectIdeaFromList = useCallback(
      (selectedIdeaId: string | null) => {
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const ideaPoint = ideaMarkers?.data?.find(
          (idea) => idea.id === selectedIdeaId
        )?.attributes?.location_point_geojson;

        if (selectedIdeaId && ideaPoint && esriMapView) {
          goToMapLocation(ideaPoint, esriMapView).then(() => {
            // Create a graphic symbol to highlight the selected point
            const graphic = new Graphic({
              geometry: new Point({
                latitude: ideaPoint.coordinates[1],
                longitude: ideaPoint.coordinates[0],
              }),
              symbol: ideaIconSecondary,
            });
            esriMapView.graphics.removeAll();
            // Show the graphic on the map for a few seconds to highlight the selected point
            esriMapView.graphics.add(graphic);
            setTimeout(() => {
              esriMapView.graphics.removeAll();
            }, 2000);

            setSelectedIdea(selectedIdeaId);
            return;
          });
        }
        setSelectedIdea(selectedIdeaId);
      },
      [ideaMarkers, esriMapView, ideaIconSecondary, setSelectedIdea]
    );

    return (
      <>
        <StyledMapContainer ref={containerRef}>
          <InnerContainer
            leftMargin={innerContainerLeftMargin}
            isPostingEnabled={true}
            id="e2e-ideas-map"
          >
            <EsriMap
              initialData={{
                center: mapConfig?.data.attributes.center_geojson,
                zoom: Number(mapConfig?.data.attributes.zoom_level),
                showLayerVisibilityControl: true,
                showLegend: true,
                zoomWidgetLocation: 'right',
                onInit: onMapInit,
              }}
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              webMapId={mapConfig?.data?.attributes?.esri_web_map_id}
              height={isMobileOrSmaller ? '68vh' : '80vh'}
              layers={layers}
              onHover={onMapHover}
              onClick={onMapClick}
              id="e2e-ideas-map"
              // Only show user location on mobile screens
              showUserLocation={isTabletOrSmaller}
            />
            <LayerHoverLabel
              layer={mapConfig?.data.attributes.layers.find(
                (layer) => layer.id === hoveredLayerId
              )}
            />
            {phaseId && (
              <StartIdeaButton
                modalPortalElement={startIdeaButtonNode}
                latlng={clickedMapLocation}
                phaseId={phaseId}
                projectId={projectId}
              />
            )}
            <IdeasAtLocationPopup
              setSelectedIdea={setSelectedIdea}
              portalElement={ideasAtLocationNode}
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              ideas={ideaMarkers?.data?.filter((idea) =>
                ideasSharingLocation?.includes(idea.id)
              )}
              mapView={esriMapView}
            />
            {isMobileOrSmaller && (
              <CSSTransition
                classNames="animation"
                in={!!selectedIdeaId}
                timeout={300}
              >
                <Box>
                  {ideaData && (
                    <StyledIdeaMapCard
                      idea={ideaData}
                      onClose={() => {
                        setSelectedIdea(null);
                      }}
                      onSelectIdea={(ideaId: string) => {
                        clHistory.push(
                          `/ideas/${ideaData.attributes.slug}?go_back=true`,
                          {
                            scrollToTop: true,
                          }
                        );
                        setSelectedIdea(ideaId);
                      }}
                      isClickable={true}
                      projectId={projectId}
                      phaseId={phaseId}
                    />
                  )}
                </Box>
              </CSSTransition>
            )}
            {!isMobileOrSmaller && (
              <Box
                width="390px"
                height={`calc(${mapHeightDesktop} - 80px)`}
                position="absolute"
                top="25px"
                left="25px"
                zIndex="900"
                display="flex"
              >
                <IdeaMapOverlay
                  projectId={projectId}
                  phaseId={phaseId}
                  onSelectIdea={onSelectIdeaFromList}
                  selectedIdeaId={selectedIdeaId}
                  inputFiltersProps={inputFiltersProps}
                />
              </Box>
            )}
            <InstructionMessage projectId={projectId} />
          </InnerContainer>
        </StyledMapContainer>
        {isMobileOrSmaller && (
          <Box width="100%" mt="8px">
            <IdeaMapOverlay
              projectId={projectId}
              phaseId={phaseId}
              onSelectIdea={onSelectIdeaFromList}
              selectedIdeaId={selectedIdeaId}
            />
          </Box>
        )}
      </>
    );
  }
);

export default IdeasMap;
