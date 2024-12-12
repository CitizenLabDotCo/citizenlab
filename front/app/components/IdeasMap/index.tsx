import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  useBreakpoint,
  useWindowSize,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';

import { IIdeaMarkers } from 'api/idea_markers/types';
import { IMapConfig } from 'api/map_config/types';
import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import LayerHoverLabel from 'components/ConfigurationMap/components/LayerHoverLabel';
import EsriMap from 'components/EsriMap';
import {
  showAddInputPopup,
  goToMapLocation,
  esriPointToGeoJson,
  changeCursorOnHover,
  parseLayers,
} from 'components/EsriMap/utils';
import { Props as InputFiltersProps } from 'components/IdeaCards/IdeasWithFiltersSidebar/InputFilters';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isAdmin } from 'utils/permissions/roles';

import IdeaMapOverlay from './desktop/IdeaMapOverlay';
import IdeasAtLocationPopup from './IdeasAtLocationPopup';
import InstructionMessage from './InstructionMessage';
import messages from './messages';
import MobileIdeaOverlay from './mobile/MobileIdeaOverlay';
import StartIdeaButton from './StartIdeaButton';
import {
  InnerContainer,
  generateIdeaFeatureLayer,
  generateIdeaMapGraphics,
  getIdeaSymbol,
  getInnerContainerLeftMargin,
  handleListIdeaSelection,
  initialContainerWidth,
  initialInnerContainerLeftMargin,
  mapHeightDesktop,
  openIdeaSelectionPopup,
  openSelectedIdeaPanel,
} from './utils';

// Custom styling for Esri map
const StyledMapContainer = styled(Box)`
  position: relative;
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
    const isMobileOrSmaller = useBreakpoint('phone');

    const { data: phase } = usePhase(phaseId);
    const { data: authUser } = useAuthUser();

    // Data from search params
    const [searchParams] = useSearchParams();
    const selectedIdea = searchParams.get('idea_map_id');

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

    const selectedIdeaData = ideaMarkers?.data.find(
      (idea) => idea.id === selectedIdea
    );

    // Map icons for ideas
    const ideaIcon = useMemo(() => {
      return getIdeaSymbol('primary', theme);
    }, [theme]);
    const ideaIconSelected = useMemo(() => {
      return getIdeaSymbol('selected', theme);
    }, [theme]);

    // Existing handling for dynamic container width
    const { windowWidth } = useWindowSize();

    // Container width state (old code). TODO: Clean this up.
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
    const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
      initialInnerContainerLeftMargin
    );

    // Update container width when window width changes (old code). TODO: Clean this up.
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
    }, [windowWidth, containerWidth]);

    // Create Esri layers from mapConfig layers
    const mapLayers = useMemo(() => {
      return parseLayers(mapConfig, localize);
    }, [mapConfig, localize]);

    // Create a point graphics layer for idea pins
    const graphics = useMemo(() => {
      return generateIdeaMapGraphics(ideaMarkers);
    }, [ideaMarkers]);

    // Create an Esri feature layer from the idea pin graphics so we can add a cluster display
    const ideasLayer = useMemo(() => {
      if (graphics) {
        return generateIdeaFeatureLayer({
          FeatureLayer,
          graphics,
          ideaIcon,
          ideaIconSelected,
          ideasAtLocationNode,
          theme,
          formatMessage,
        });
      }
      return undefined;
    }, [
      graphics,
      ideaIcon,
      ideaIconSelected,
      ideasAtLocationNode,
      theme,
      formatMessage,
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
            const point = ideaMarkers?.data.find(
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
          (phase?.data.attributes.submission_enabled && authUser) ||
          isAdmin(authUser);

        // On map click, we either open an existing idea OR show the "submit an idea" popup.
        // This depends on whether the user has clicked an existing map pin.
        mapView.hitTest(event).then((result) => {
          // Get any map elements underneath map click
          const elements = result.results;
          if (elements.length > 0) {
            // There are map elements, which means the user clicked a layer, idea pin OR a cluster
            const topElement = elements[0];

            if (topElement.type === 'graphic') {
              const graphicId = topElement.graphic.attributes.ID;
              const clusterCount = topElement.graphic.attributes.cluster_count;

              if (clusterCount) {
                // User clicked a cluster. Zoom in on the cluster.
                goToMapLocation(
                  esriPointToGeoJson(topElement.mapPoint),
                  mapView,
                  mapView.zoom + 3
                );
              } else if (graphicId) {
                // User clicked an idea pin or layer.
                const ideaId = topElement.graphic.attributes.ideaId;
                const ideasAtClickCount = elements.filter(
                  (element) =>
                    element.type === 'graphic' &&
                    element.graphic.layer.id === 'ideasLayer'
                ).length;

                // If there are multiple ideas at this same location (overlapping pins), show the idea selection popup.
                if (ideasAtClickCount > 1 && mapView.zoom >= 19) {
                  openIdeaSelectionPopup({
                    setIdeasSharingLocation,
                    topElement,
                    mapView,
                    elements,
                  });
                } else {
                  // Otherwise, open the selected idea in the information panel
                  if (ideaId) {
                    openSelectedIdeaPanel({
                      ideaId,
                      mapView,
                      topElement,
                      ideaIconSelected,
                      setSelectedIdea,
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
        setSelectedIdea,
        authUser,
        phase?.data.attributes.submission_enabled,
        startIdeaButtonNode,
        formatMessage,
        ideaIconSelected,
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
            const customParameters = topElement.layer['customParameters'];
            setHoveredLayerId(customParameters?.layerId || null);
          }
        } else {
          setHoveredLayerId(null);
        }
      });
    }, []);

    const onSelectIdeaFromList = useCallback(
      (selectedIdeaId: string | null) => {
        const ideaPoint = ideaMarkers?.data.find(
          (idea) => idea.id === selectedIdeaId
        )?.attributes.location_point_geojson;

        if (selectedIdeaId && ideaPoint && esriMapView) {
          handleListIdeaSelection({
            ideaPoint,
            selectedIdeaId,
            ideaIconSelected,
            esriMapView,
            setSelectedIdea,
          });
        }
        setSelectedIdea(selectedIdeaId);
      },
      [ideaMarkers, esriMapView, ideaIconSelected, setSelectedIdea]
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
              id="e2e-ideas-map"
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
              ideas={ideaMarkers?.data.filter((idea) =>
                ideasSharingLocation?.includes(idea.id)
              )}
              mapView={esriMapView}
            />
            {isMobileOrSmaller && (
              <MobileIdeaOverlay
                selectedIdea={null}
                setSelectedIdea={setSelectedIdea}
                selectedIdeaData={selectedIdeaData}
                projectId={projectId}
                phaseId={phaseId}
              />
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
                  selectedIdea={selectedIdea}
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
              selectedIdea={selectedIdea}
            />
          </Box>
        )}
      </>
    );
  }
);

export default IdeasMap;
