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
  media,
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

import EsriMap from 'components/EsriMap';
import {
  getMapPinSymbol,
  getClusterConfiguration,
  showAddInputPopup,
  goToMapLocation,
  esriPointToGeoJson,
  changeCursorOnHover,
  parseLayers,
} from 'components/EsriMap/utils';
import LayerHoverLabel from 'components/IdeationConfigurationMap/components/LayerHoverLabel';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isAdmin } from 'utils/permissions/roles';

import DesktopIdeaMapOverlay from './desktop/IdeaMapOverlay';
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
const StyledDesktopIdeaMapOverlay = styled(DesktopIdeaMapOverlay)`
  width: 390px;
  height: calc(${mapHeightDesktop} - 80px);
  position: absolute;
  display: flex;
  top: 25px;
  left: 25px;
  z-index: 900;

  ${media.tablet`
    display: none;
  `}
`;

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
  calcite-action-bar {
    display: none;
  }

  calcite-action {
    display: none !important;
  }

  .esri-popup__main-container {
    max-width: 300px !important;
  }
`;

export interface Props {
  projectId: string;
  phaseId?: string;
  mapConfig?: IMapConfig | null;
  ideaMarkers?: IIdeaMarkers;
}

const IdeasMap = memo<Props>(
  ({ projectId, phaseId, mapConfig, ideaMarkers }: Props) => {
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

    const selectedIdea = searchParams.get('idea_map_id');

    const ideaData = ideaMarkers?.data.find((idea) => idea.id === selectedIdea);

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
      const ideasWithLocations = ideaMarkers?.data?.filter(
        (idea) => idea?.attributes?.location_point_geojson
      );
      return ideasWithLocations?.map((idea) => {
        const coordinates =
          idea?.attributes?.location_point_geojson?.coordinates;
        return new Graphic({
          geometry: new Point({
            longitude: coordinates?.[0],
            latitude: coordinates?.[1],
          }),
          attributes: {
            ideaId: idea?.id,
          },
        });
      });
    }, [ideaMarkers]);

    // Create an Esri feature layer from the idea pin graphics so we can add a cluster display
    const ideasLayer = useMemo(() => {
      if (graphics) {
        return new FeatureLayer({
          source: graphics, // Array of idea graphics
          title: formatMessage(messages.userInputs),
          id: 'ideasLayer',
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
            symbol: getMapPinSymbol({
              color: theme.colors.tenantPrimary,
              sizeInPx: 42,
            }),
          }),
          legendEnabled: false,
          // Add cluster display to this layer
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
          if (selectedIdea) {
            const point = ideaMarkers?.data?.find(
              (idea) => idea.id === selectedIdea
            )?.attributes.location_point_geojson;

            if (!point) return;

            setTimeout(() => {
              goToMapLocation(point, mapView);
            }, 1000);
          }
        }
      },
      [esriMapView, selectedIdea, ideaMarkers]
    );

    const onMapClick = useCallback(
      (event: any, mapView: MapView) => {
        // Save clicked location
        setClickedMapLocation(esriPointToGeoJson(event.mapPoint));

        const ideaPostingEnabled =
          (phase?.data.attributes.posting_enabled && authUser) ||
          isAdmin(authUser);

        // On map click, we either open an existing idea OR show the "submit an idea" popup.
        // This depends on whether the user has clicked an existing map pin.
        mapView.hitTest(event).then((result) => {
          // Get any map elements underneath map click
          const elements = result.results;
          if (elements.length > 0) {
            // There are map elements - user clicked a layer, idea pin OR a cluster
            const topElement = elements[0];

            if (topElement.type === 'graphic') {
              const graphicId = topElement?.graphic?.attributes?.ID;
              const clusterCount =
                topElement?.graphic?.attributes?.cluster_count;
              if (clusterCount) {
                // User clicked a cluster. Zoom in on the cluster.
                goToMapLocation(
                  esriPointToGeoJson(topElement.mapPoint),
                  mapView,
                  mapView.zoom + 3
                );
              } else if (graphicId) {
                // User clicked an idea pin or layer.
                const ideaId =
                  topElement.layer.id === 'ideasLayer'
                    ? graphics?.at(graphicId - 1)?.attributes.ideaId
                    : undefined;

                const ideasAtClickCount = elements.filter(
                  (element) =>
                    element.type === 'graphic' &&
                    element?.graphic?.layer.id === 'ideasLayer'
                ).length;

                // If there are multiple ideas at this same location (overlapping pins), show the idea selection popup.
                if (ideasAtClickCount > 1 && mapView.zoom >= 19) {
                  goToMapLocation(
                    esriPointToGeoJson(topElement.mapPoint),
                    mapView
                  ).then(() => {
                    const ideaIds = elements.map((element) => {
                      // Get list of idea ids at this location
                      if (element.type === 'graphic') {
                        const graphicId = element?.graphic?.attributes?.ID;
                        const layerId = element?.graphic?.layer?.id;
                        const ideaId = graphics?.at(graphicId - 1)?.attributes
                          .ideaId;
                        if (ideaId && layerId === 'ideasLayer') {
                          return ideaId;
                        }
                      }
                    });
                    // Set state and open the idea selection popup
                    setIdeasSharingLocation(ideaIds);
                    mapView.popup.open({
                      features: [topElement.graphic],
                      location: topElement.mapPoint,
                    });
                  });
                } else {
                  // Otherwise, open the selected idea in the information panel
                  if (ideaId) {
                    goToMapLocation(
                      esriPointToGeoJson(topElement.mapPoint),
                      mapView
                    ).then(() => {
                      setSelectedIdea(ideaId);
                      // Add a graphic symbol to highlight which point was clicked
                      const geometry = topElement.graphic.geometry;
                      if (geometry.type === 'point') {
                        const graphic = new Graphic({
                          geometry,
                          symbol: getMapPinSymbol({
                            color: theme.colors.tenantSecondary,
                            sizeInPx: 42,
                          }),
                        });
                        mapView.graphics.removeAll();

                        // Add the graphic to the map for a few seconds to highlight the clicked point
                        mapView.graphics.add(graphic);
                        setTimeout(() => {
                          mapView.graphics.removeAll();
                        }, 2000);
                      }
                    });
                  }
                }
              } else {
                // Show the "Submit an idea" popup
                if (ideaPostingEnabled) {
                  showAddInputPopup({
                    event,
                    mapView,
                    setSelectedInput: setSelectedIdea,
                    popupContentNode: startIdeaButtonNode,
                    popupTitle: formatMessage(messages.submitIdea),
                  });
                }
              }
            }
          } else {
            // If the user clicked elsewhere on the map, show the "Submit an idea" popup
            if (ideaPostingEnabled) {
              showAddInputPopup({
                event,
                mapView,
                setSelectedInput: setSelectedIdea,
                popupContentNode: startIdeaButtonNode,
                popupTitle: formatMessage(messages.submitIdea),
              });
            }
          }
        });
      },
      [
        graphics,
        setSelectedIdea,
        theme.colors.tenantSecondary,
        authUser,
        phase?.data.attributes.posting_enabled,
        startIdeaButtonNode,
        formatMessage,
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
              symbol: getMapPinSymbol({
                color: theme.colors.tenantSecondary,
                sizeInPx: 42,
              }),
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
      [ideaMarkers, esriMapView, theme.colors.tenantSecondary, setSelectedIdea]
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
              webMapId={mapConfig?.data.attributes.esri_web_map_id}
              height={isMobileOrSmaller ? '68vh' : '80vh'}
              layers={layers}
              onHover={onMapHover}
              onClick={onMapClick}
            />
            <LayerHoverLabel
              layer={mapConfig?.data.attributes.layers.find(
                (layer) => layer.id === hoveredLayerId
              )}
            />
            {phaseId && projectId && (
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
              ideas={ideaMarkers?.data?.filter((idea) =>
                ideasSharingLocation?.includes(idea.id)
              )}
              mapView={esriMapView}
            />
            {isTabletOrSmaller && (
              <CSSTransition
                classNames="animation"
                in={!!selectedIdea}
                timeout={300}
              >
                <Box>
                  {ideaData && (
                    <StyledIdeaMapCard
                      idea={ideaData}
                      onClose={() => {
                        setSelectedIdea(null);
                      }}
                      onSelectIdea={setSelectedIdea}
                      isClickable={true}
                      projectId={projectId}
                      phaseId={phaseId}
                    />
                  )}
                </Box>
              </CSSTransition>
            )}
            <StyledDesktopIdeaMapOverlay
              projectId={projectId}
              phaseId={phaseId}
              onSelectIdea={onSelectIdeaFromList}
              selectedIdea={selectedIdea}
            />
            <InstructionMessage projectId={projectId} />
          </InnerContainer>
        </StyledMapContainer>
      </>
    );
  }
);

export default IdeasMap;
