import React, { useCallback, useEffect, useState } from 'react';

import Layer from '@arcgis/core/layers/Layer';
import MapView from '@arcgis/core/views/MapView';
import { Box } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { Point } from 'geojson';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';

import EsriMap from 'components/EsriMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';
import { Option } from 'components/UI/LocationInput';

import { useIntl } from 'utils/cl-intl';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../../../ErrorDisplay';
import InstructionAnimation from '../components/InstructionAnimation';
import LocationTextInput from '../components/LocationTextInput';
import RemoveAnswerButton from '../components/RemoveAnswerButton';
import UndoButton from '../components/UndoButton';
import {
  clearPointData,
  handleMapClickMultipoint,
  handleMapClickPoint,
  checkCoordinateErrors,
  updateDataAndDisplay,
} from '../utils';

type Props = {
  mapConfig?: IMapConfig;
  inputType: 'point' | 'line' | 'polygon';
  mapLayers?: Layer[];
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
  handleMultiPointChange?: (points: number[][] | undefined) => void;

  didBlur: boolean;
};

const DesktopView = ({
  data,
  path,
  inputType,
  errors,
  mapConfig,
  mapLayers,
  onMapInit,
  handlePointChange,
  handleMultiPointChange,
  didBlur,
  mapView,
  id,
  ...props
}: ControlProps & Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });
  const layerCount = mapConfig?.data?.attributes?.layers?.length || 0;

  // Create refs for custom UI elements
  const resetButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
  const undoButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
  const instructionRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Add custom UI elements to the map
  useEffect(() => {
    mapView?.ui?.add(instructionRef?.current || '', 'bottom-left');
    if (inputType !== 'point') {
      // Only add for line/polygon input
      mapView?.ui?.add(undoButtonRef?.current || '', 'top-right');
      mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
      return;
    }
    mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
  }, [
    id,
    inputType,
    instructionRef,
    mapView?.ui,
    resetButtonRef,
    undoButtonRef,
  ]);

  // Show graphic(s) on the map for user input
  useEffect(() => {
    if (data) {
      updateDataAndDisplay({
        data,
        mapView,
        inputType,
        locale,
        theme,
        setAddress,
      });
    } else {
      // Clear the map if there is no data
      clearPointData(mapView, setAddress);
    }
  }, [data, id, inputType, locale, mapView, theme]);

  // When the user clicks on the map, update the form data
  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      if (inputType === 'point') {
        handleMapClickPoint(event, mapView, handlePointChange);
      } else {
        // Line or polygon input
        handleMapClickMultipoint(event, mapView, handleMultiPointChange);
      }
    },
    [handleMultiPointChange, handlePointChange, inputType]
  );

  // Handle typed address input
  const handleLocationInputChange = (point: Point | undefined) => {
    inputType === 'point' && handlePointChange?.(point);
  };

  return (
    <>
      <Box display="flex" flexDirection="column" mb="8px">
        {inputType === 'point' && (
          <Box mb="12px">
            <LocationTextInput
              address={address}
              handlePointChange={handleLocationInputChange}
            />
          </Box>
        )}
        <>
          <EsriMap
            id="e2e-point-control-map"
            height="420px"
            layers={mapLayers}
            initialData={{
              zoom: Number(mapConfig?.data.attributes.zoom_level),
              // TODO: Cleanup this logic + set to extent of the data instead.
              center:
                inputType === 'point'
                  ? data || mapConfig?.data.attributes.center_geojson
                  : data?.[0] || mapConfig?.data.attributes.center_geojson,
              showLegend: layerCount > 0,
              showLayerVisibilityControl: layerCount > 0,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            onClick={onMapClick}
          />
          {inputType !== 'point' &&
            data && ( // Only show for line/polygon input
              <RemoveAnswerButton
                mapView={mapView}
                handleMultiPointChange={handleMultiPointChange}
              />
            )}
          <Box>
            {inputType !== 'point' && ( // Only show for line/polygon input
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
            <InstructionAnimation
              instructionRef={instructionRef}
              inputType={inputType}
              data={data}
            />
          </Box>
        </>
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={
          errors ||
          checkCoordinateErrors({
            data,
            inputType,
            schema: props.schema,
            formatMessage,
          })
        }
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default DesktopView;
