import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Graphic from '@arcgis/core/Graphic';
import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Button,
  Icon,
  Label,
  colors,
} from '@citizenlab/cl2-component-library';
import { createPortal } from 'react-dom';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';
import { parseLayers } from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';

import messages from '../../../messages';
import InstructionAnimation from '../components/InstructionAnimation';
import UndoButton from '../components/UndoButton';
import {
  handleMapClickMultipoint,
  isLineOrPolygonInput,
  setupPointDrag,
} from '../multiPointUtils';
import { clearPointData, handleMapClickPoint } from '../pointUtils';
import {
  getInitialMapCenter,
  MapInputType,
  updateDataAndDisplay,
} from '../utils';

type Props = {
  setShowFullscreenMap: (show: boolean) => void;
  mapConfig?: IMapConfig;
  data: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon | undefined;
  handleSinglePointChange: (point: GeoJSON.Point | undefined) => void;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
  inputType: MapInputType;
  mapViewSurveyPage?: MapView | null;
  questionPageMapView?: MapView | null;
};

const FullscreenMapInput = memo<Props>(
  ({
    setShowFullscreenMap,
    mapConfig,
    data,
    handleSinglePointChange,
    handleMultiPointChange,
    inputType,
    questionPageMapView,
  }: Props) => {
    const theme = useTheme();
    const locale = useLocale();
    const localize = useLocalize();
    const { formatMessage } = useIntl();

    const clientHeight = window.innerHeight;
    const bottomSectionRef = useRef<HTMLDivElement>(null);
    const [mapView, setMapView] = useState<MapView | null>(null);
    const modalPortalElement = document.getElementById('modal-portal');
    const isWebMap = !!mapConfig?.data.attributes.esri_web_map_id;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const layerCount = mapConfig?.data?.attributes?.layers?.length || 0;

    // Create refs for dragging/editing a user's points on the map
    const pointBeingDragged = useRef<Graphic | null>(null);
    const temporaryDragGraphic = useRef<Graphic | null>(null);

    // Create refs for custom UI elements
    const resetButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
    const undoButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
    const instructionRef: React.RefObject<HTMLDivElement> = React.createRef();

    // Create map layers from map configuration to load in
    const mapLayers = useMemo(() => {
      return parseLayers(mapConfig, localize);
    }, [localize, mapConfig]);

    // On mapInit, persist the mapView in state
    const onMapInit = useCallback((mapView: MapView) => {
      setMapView(mapView);
    }, []);

    // When the user clicks on the map, update the form data
    const onMapClick = useCallback(
      (event: any, mapView: MapView) => {
        if (inputType === 'point') {
          handleMapClickPoint(event, mapView, handleSinglePointChange);
        } else if (isLineOrPolygonInput(inputType)) {
          handleMapClickMultipoint(event, mapView, handleMultiPointChange);
        }
      },
      [handleMultiPointChange, handleSinglePointChange, inputType]
    );

    // Add the custom UI elements to the map
    useEffect(() => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapView?.ui?.add(instructionRef?.current || '', 'bottom-left');
    }, [instructionRef, mapView?.ui, resetButtonRef]);

    // Show graphic(s) on the map for user input
    useEffect(() => {
      if (data) {
        updateDataAndDisplay({
          data,
          mapView,
          inputType,
          locale,
          theme,
          isMobileOrSmaller: true,
        });
      } else {
        clearPointData(mapView);
      }
    }, [data, inputType, locale, mapView, theme]);

    // Get map height by calculating the height of the bottom section
    const getMapHeight = () => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      return bottomSectionRef?.current?.clientHeight
        ? // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          clientHeight - bottomSectionRef?.current?.clientHeight
        : clientHeight;
    };

    // Handle back button click
    const handleBack = () => {
      setShowFullscreenMap(false);
    };

    // Check if confirm button is enabled
    const isConfirmEnabled = () => {
      if (!data || !('coordinates' in data)) return false;
      switch (inputType) {
        case 'point':
        case 'line':
          return data.coordinates.length >= 2;
        case 'polygon':
          // For polygon, check if the first ring has 4+ points (3 points + 1 duplicated to close)
          return (
            Array.isArray(data.coordinates[0]) &&
            data.coordinates[0].length >= 4
          );
      }
    };

    // Attach behaviour for when a user edits a point by dragging it
    useEffect(() => {
      isLineOrPolygonInput(inputType) &&
        handleMultiPointChange &&
        setupPointDrag({
          mapView,
          handleMultiPointChange,
          pointBeingDragged,
          temporaryDragGraphic,
          tenantSecondaryColor: theme.colors.tenantSecondary,
          data,
          inputType,
          pointSymbolSize: 26,
        });
    }, [data, handleMultiPointChange, inputType, mapView, theme]);

    return modalPortalElement
      ? createPortal(
          <Box
            width="100vw"
            height="100%"
            position="fixed"
            top="0"
            left="0"
            display="block"
            background="white"
            zIndex="99999999"
          >
            <Box display="flex" flexDirection="column">
              <EsriMap
                id="fullscreenMap"
                height={`${getMapHeight()}px`}
                layers={mapLayers}
                initialData={{
                  zoom: Number(mapConfig?.data.attributes.zoom_level),
                  center: getInitialMapCenter(inputType, mapConfig, data),
                  showLegend: isWebMap || layerCount > 0,
                  showLayerVisibilityControl: isWebMap || layerCount > 0,
                  showLegendExpanded: false,
                  showZoomControls: true,
                  onInit: onMapInit,
                }}
                onClick={onMapClick}
                webMapId={mapConfig?.data.attributes.esri_web_map_id}
              />
              <Box>
                <ResetMapViewButton
                  resetButtonRef={resetButtonRef}
                  mapConfig={mapConfig}
                  mapView={mapView}
                />
                <InstructionAnimation
                  instructionRef={instructionRef}
                  inputType={inputType}
                  data={data}
                />
              </Box>
              <Box
                p="16px"
                pb="0px"
                background="white"
                width="100vw"
                zIndex="99999"
                ref={bottomSectionRef}
                position="sticky"
              >
                <Box>
                  <Label>
                    <Box display="flex">
                      <Icon
                        name="info-outline"
                        fill={colors.coolGrey600}
                        mr="4px"
                      />
                      <Box my="auto">
                        {inputType === 'point'
                          ? formatMessage(messages.tapOnFullscreenMapToAddPoint)
                          : formatMessage(messages.tapOnFullscreenMapToAdd)}
                      </Box>
                    </Box>
                  </Label>
                </Box>
                <Box
                  borderTop={`1px solid ${colors.grey400}`}
                  mt="20px"
                  p="20px"
                  gap="16px"
                  display="flex"
                  width="100vw"
                  justifyContent="flex-end"
                >
                  {!data && (
                    <Button
                      icon="arrow-left"
                      buttonStyle="secondary-outlined"
                      onClick={handleBack}
                    >
                      {formatMessage(messages.back)}
                    </Button>
                  )}
                  {data && isLineOrPolygonInput(inputType) && (
                    <UndoButton
                      handleMultiPointChange={handleMultiPointChange}
                      mapView={mapView}
                      undoButtonRef={undoButtonRef}
                      undoEnabled={
                        'coordinates' in data &&
                        Array.isArray(data.coordinates) &&
                        data.coordinates.length > 0
                      }
                      inputType={inputType}
                      buttonStyle="secondary"
                    />
                  )}
                  <Button
                    mr="20px"
                    onClick={() => {
                      if (questionPageMapView && mapView) {
                        questionPageMapView.extent = mapView.extent;
                      }
                      setShowFullscreenMap(false);
                    }}
                    disabled={!isConfirmEnabled()}
                  >
                    {formatMessage(messages.confirm)}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>,
          modalPortalElement
        )
      : null;
  }
);

export default FullscreenMapInput;
