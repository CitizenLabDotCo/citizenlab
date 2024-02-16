import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

// components
import EsriMap from 'components/EsriMap';
import MapView from '@arcgis/core/views/MapView';
import LayerHoverLabel from 'modules/commercial/custom_maps/admin/containers/ProjectCustomMapConfigPage/LayerHoverLabel';
import DesktopIdeaMapOverlay from './desktop/IdeaMapOverlay';
import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Renderer from '@arcgis/core/renderers/SimpleRenderer';
import InstructionMessage from './InstructionMessage';
import {
  Box,
  media,
  useBreakpoint,
  useWindowSize,
  viewportWidths,
} from '@citizenlab/cl2-component-library';

// hooks
import useLocalize from 'hooks/useLocalize';

// utils
import {
  createEsriGeoJsonLayers,
  getMapPinSymbol,
  getClusterConfiguration,
  showAddInputPopup,
  goToMapLocation,
  esriPointToGeoJson,
} from 'components/EsriMap/utils';
import {
  InnerContainer,
  getInnerContainerLeftMargin,
  initialContainerWidth,
  initialInnerContainerLeftMargin,
  mapHeightDesktop,
  mapHeightMobile,
} from './utils';
import styled, { useTheme } from 'styled-components';
import { CSSTransition } from 'react-transition-group';

// types
import { IMapConfig } from 'modules/commercial/custom_maps/api/map_config/types';
import { IIdeaData } from 'api/ideas/types';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import StartIdeaButton from './StartIdeaButton';
import IdeaMapCard from './IdeaMapCard';

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

  .esri-popup__main-container {
    max-width: 300px !important;
  }
`;

export interface Props {
  mapConfig: IMapConfig;
  projectId: string;
  phaseId?: string;
  ideasList: IIdeaData[];
}

const IdeasMap = memo<Props>(
  ({ mapConfig, projectId, phaseId, ideasList }: Props) => {
    const theme = useTheme();
    const localize = useLocalize();
    const { formatMessage } = useIntl();
    const [searchParams] = useSearchParams();
    const isMobileOrSmaller = useBreakpoint('phone');
    const isTabletOrSmaller = useBreakpoint('tablet');

    // Create a div element to use for inserting React components into Esri map popup
    // Docs: https://developers.arcgis.com/javascript/latest/custom-ui/#introduction
    const startIdeaButtonNode = useMemo(() => {
      return document.createElement('div');
    }, []);

    // Map state variables
    const [esriMapView, setEsriMapview] = useState<MapView | null>(null);
    const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);
    const [clickedMapLocation, setClickedMapLocation] =
      useState<GeoJSON.Point | null>(null);
    const [selectedIdea, setSelectedIdea] = useState<string | null>(
      searchParams.get('selected_idea_id') || null
    );

    // Handling for dynamic container width
    const { windowWidth } = useWindowSize();
    const tablet = windowWidth <= viewportWidths.tablet;

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

    // Create and configure the map data
    // Create GeoJSON layers to add to Esri map
    const geoJsonLayers = useMemo(() => {
      return createEsriGeoJsonLayers(
        mapConfig.data.attributes.layers,
        localize
      );
    }, [mapConfig, localize]);

    // Create point graphics layer from ideas list and add to Esri map
    const graphics = useMemo(() => {
      return ideasList?.map((idea) => {
        return new Graphic({
          geometry: new Point({
            longitude: idea?.attributes?.location_point_geojson?.coordinates[0],
            latitude: idea?.attributes?.location_point_geojson?.coordinates[1],
          }),
          attributes: {
            ideaId: idea?.id,
          },
        });
      });
    }, [ideasList]);

    // Create an Esri map layer from the graphics so we can add a cluster display
    const ideasLayer = useMemo(() => {
      if (graphics) {
        return new FeatureLayer({
          source: graphics, // Array of initiative graphics
          title: formatMessage(messages.userInputs),
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
          // Add cluster display to this layer
          featureReduction: getClusterConfiguration(theme.colors.tenantPrimary),
        });
      }
      return undefined;
    }, [formatMessage, graphics, theme.colors.tenantPrimary]);

    const onMapClick = useCallback(
      (event: any, mapView: MapView) => {
        // On map click, we either open an existing idea OR show the "submit an idea" popup
        // depending on whether the user has clicked an existing map feature.
        mapView.hitTest(event).then((result) => {
          const elements = result.results; // These are map elements underneath our map click
          if (elements.length > 0) {
            const topElement = elements[0];
            // User clicked an idea pin OR a cluster
            if (topElement.type === 'graphic') {
              const graphicId = topElement?.graphic?.attributes?.ID;
              const clusterCount =
                topElement?.graphic?.attributes?.cluster_count;
              if (clusterCount) {
                // User clicked a cluster. Zoom in on the cluster.
                goToMapLocation(
                  esriPointToGeoJson(topElement.mapPoint),
                  mapView,
                  mapView.zoom + 2
                );
              } else if (graphicId) {
                // User clicked an idea pin. Zoom to pin & open idea in information panel.
                const ideaId = graphics?.at(graphicId - 1)?.attributes.ideaId;

                if (ideaId) {
                  goToMapLocation(
                    esriPointToGeoJson(topElement.mapPoint),
                    mapView
                  ).then(() => {
                    setSelectedIdea(ideaId);
                    // Add graphic symbol
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
                      mapView.graphics.add(graphic);
                      setTimeout(() => {
                        mapView.graphics.removeAll();
                      }, 4000);
                    }
                  });
                }
              } else {
                // Show the "Submit an idea" popup
                showAddInputPopup({
                  event,
                  mapView,
                  setClickedMapLocation,
                  setSelectedInput: setSelectedIdea,
                  popupContentNode: startIdeaButtonNode,
                  popupTitle: formatMessage(messages.submitIdea),
                });
              }
            }
          } else {
            showAddInputPopup({
              event,
              mapView,
              setClickedMapLocation,
              setSelectedInput: setSelectedIdea,
              popupContentNode: startIdeaButtonNode,
              popupTitle: formatMessage(messages.submitIdea),
            });
          }
        });
      },
      [
        formatMessage,
        graphics,
        startIdeaButtonNode,
        theme.colors.tenantSecondary,
      ]
    );

    const onMapHover = useCallback(
      (event: any, mapView: MapView) => {
        // Save the esriMapView in state
        if (!esriMapView) {
          setEsriMapview(mapView);
        }

        mapView.hitTest(event).then((result) => {
          const elements = result.results; // These are map elements underneath our cursor
          if (elements.length > 0) {
            // User hovered over an element on the map
            const topElement = elements[0];
            // Change cursor to pointer
            document.body.style.cursor = 'pointer';
            if (topElement.type === 'graphic') {
              // Set the hovered layer id
              const customParameters =
                topElement.layer && topElement.layer['customParameters'];
              setHoveredLayerId(customParameters?.layerId || null);
            }
          } else {
            document.body.style.cursor = 'auto';
            setHoveredLayerId(null);
          }
        });
      },
      [esriMapView]
    );

    const onSelectIdeaFromList = useCallback(
      (selectedIdeaId: string | null) => {
        const ideaPoint = ideasList.find((idea) => idea.id === selectedIdeaId)
          ?.attributes?.location_point_geojson;

        if (selectedIdeaId && ideaPoint && esriMapView) {
          goToMapLocation(ideaPoint, esriMapView).then(() => {
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
            esriMapView.graphics.add(graphic);
            setTimeout(() => {
              esriMapView.graphics.removeAll();
            }, 4000);

            setSelectedIdea(selectedIdeaId);
            return;
          });
        }

        setSelectedIdea(selectedIdeaId);
      },
      [ideasList, esriMapView, theme.colors.tenantSecondary]
    );

    return (
      <>
        <StyledMapContainer ref={containerRef}>
          <InnerContainer
            leftMargin={innerContainerLeftMargin}
            isPostingEnabled={true}
          >
            <EsriMap
              initialData={{
                center: mapConfig.data.attributes.center_geojson,
                zoom: Number(mapConfig.data.attributes.zoom_level),
                showLayerVisibilityControl: true,
                showLegend: true,
                zoomWidgetLocation: 'right',
              }}
              height={isMobileOrSmaller ? '68vh' : '80vh'}
              layers={
                ideasLayer ? [...geoJsonLayers, ideasLayer] : geoJsonLayers
              }
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
            {isTabletOrSmaller && (
              <CSSTransition
                classNames="animation"
                in={!!selectedIdea}
                timeout={300}
              >
                <StyledIdeaMapCard
                  idea={ideasList?.find(({ id }) => id === selectedIdea)}
                  onClose={() => {
                    setSelectedIdea(null);
                  }}
                  onSelectIdea={setSelectedIdea}
                  isClickable={true}
                  projectId={projectId}
                  phaseId={phaseId}
                />
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
