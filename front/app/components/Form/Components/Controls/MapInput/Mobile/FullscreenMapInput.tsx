import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Button,
  Icon,
  Label,
  colors,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { createPortal } from 'react-dom';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';
import { parseLayers } from 'components/EsriMap/utils';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { sanitizeForClassname, getLabel } from 'utils/JSONFormUtils';

import messages from '../../messages';
import UndoButton from '../components/UndoButton';
import {
  clearPointData,
  updateMultiPointsDataAndDisplay,
  updatePointDataAndDisplay,
  handleMapClickMultipoint,
  handleMapClickPoint,
} from '../utils';

type Props = {
  setShowFullscreenMap: (show: boolean) => void;
  mapConfig?: IMapConfig;
  data: any;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
  inputType: 'point' | 'line' | 'polygon';
};

const FullscreenMapInput = memo<Props>(
  ({
    setShowFullscreenMap,
    mapConfig,
    data,
    handlePointChange,
    handleMultiPointChange,
    inputType,
    ...props
  }: ControlProps & Props) => {
    const { uischema, path, id, schema, required } = props;

    const theme = useTheme();
    const locale = useLocale();
    const localize = useLocalize();
    const { formatMessage } = useIntl();
    const clientHeight = window.innerHeight;

    // State & variables
    const bottomSectionRef = useRef<HTMLDivElement>(null);
    const [mapView, setMapView] = useState<MapView | null>(null);
    const resetButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
    const undoButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
    const modalPortalElement = document.getElementById('modal-portal');
    const layerCount = mapConfig?.data?.attributes?.layers?.length || 0;

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
          handleMapClickPoint(event, mapView, handlePointChange);
        } else if (inputType === 'line' || inputType === 'polygon') {
          handleMapClickMultipoint(event, mapView, handleMultiPointChange);
        }
      },
      [handleMultiPointChange, handlePointChange, inputType]
    );

    // Add undo and reset buttons to the map
    useEffect(() => {
      if (inputType === 'point') {
        mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
      } else {
        mapView?.ui?.add(undoButtonRef?.current || '', 'top-right');
        mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
      }
    }, [id, inputType, mapView?.ui, resetButtonRef, undoButtonRef]);

    // Show graphics on map when location point(s) change
    useEffect(() => {
      if (inputType === 'point' && data) {
        updatePointDataAndDisplay({
          data,
          mapView,
          locale,
          tenantPrimaryColor: theme.colors.tenantPrimary,
        });
      } else if (inputType === 'line' || inputType === 'polygon') {
        updateMultiPointsDataAndDisplay({
          data,
          mapView,
          inputType,
          tenantPrimaryColor: theme.colors.tenantPrimary,
        });
      } else {
        clearPointData(mapView);
      }
    }, [data, inputType, locale, mapView, theme.colors.tenantPrimary]);

    // Get map height by calculating the height of the bottom section
    const getMapHeight = () => {
      return bottomSectionRef?.current?.clientHeight
        ? clientHeight - bottomSectionRef?.current?.clientHeight
        : clientHeight;
    };

    // Handle back button click
    const handleBack = () => {
      setShowFullscreenMap(false);
    };

    // Check if confirm button is enabled
    const isConfirmEnabled = () => {
      switch (inputType) {
        case 'point':
          return !(data?.address === '');
        case 'line':
          return data?.coordinates?.length && data.coordinates.length >= 2;
        case 'polygon':
          return data?.coordinates?.length && data.coordinates.length >= 3;
      }
    };

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
                  center:
                    inputType === 'point'
                      ? data || mapConfig?.data.attributes.center_geojson
                      : data?.[0] || mapConfig?.data.attributes.center_geojson,
                  showLegend: layerCount > 0,
                  showLayerVisibilityControl: layerCount > 0,
                  showLegendExpanded: true,
                  showZoomControls: true,
                  onInit: onMapInit,
                }}
                onClick={onMapClick}
                webMapId={mapConfig?.data.attributes.esri_web_map_id}
              />
              <Box>
                {inputType !== 'point' && (
                  <UndoButton
                    handleMultiPointChange={handleMultiPointChange}
                    mapView={mapView}
                    undoButtonRef={undoButtonRef}
                    undoEnabled={data}
                    inputType={inputType}
                  />
                )}
                <ResetMapViewButton
                  resetButtonRef={resetButtonRef}
                  mapConfig={mapConfig}
                  mapView={mapView}
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
                  <FormLabel
                    htmlFor={id && sanitizeForClassname(id)}
                    labelValue={getLabel(uischema, schema, path)}
                    optional={!required}
                  />
                  <Label>
                    <Box display="flex">
                      <Icon
                        name="info-outline"
                        fill={colors.coolGrey600}
                        mr="4px"
                      />
                      <Box my="auto">
                        {formatMessage(messages.tapOnFullscreenMapToAdd)}
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
                  <Button
                    icon="arrow-left"
                    buttonStyle="secondary-outlined"
                    onClick={handleBack}
                  >
                    {formatMessage(messages.back)}
                  </Button>
                  <Button
                    mr="20px"
                    onClick={() => {
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
