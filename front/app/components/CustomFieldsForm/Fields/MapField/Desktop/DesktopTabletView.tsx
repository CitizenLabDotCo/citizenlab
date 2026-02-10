import React, { useCallback, useEffect, useRef, useState } from 'react';

import Graphic from '@arcgis/core/Graphic';
import Layer from '@arcgis/core/layers/Layer';
import MapView from '@arcgis/core/views/MapView';
import { Box, colors } from '@citizenlab/cl2-component-library';
import { Point } from 'geojson';
import { isEmpty } from 'lodash-es';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';

import EsriMap from 'components/EsriMap';
import ResetMapViewButton from 'components/EsriMap/components/ResetMapViewButton';
import { Option } from 'components/UI/LocationInput';

import InstructionAnimation from '../components/InstructionAnimation';
import LocationTextInput from '../components/LocationTextInput';
import RemoveAnswerButton from '../components/RemoveAnswerButton';
import UndoButton from '../components/UndoButton';
import {
  handleMapClickMultipoint,
  isLineOrPolygonInput,
  setupPointDrag,
} from '../multiPointUtils';
import { clearPointData, handleMapClickPoint } from '../pointUtils';
import {
  updateDataAndDisplay,
  getInitialMapCenter,
  MapInputType,
} from '../utils';

type Props = {
  mapConfig?: IMapConfig;
  inputType: MapInputType;
  mapLayers?: Layer[];
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handleSinglePointChange: (point: GeoJSON.Point | undefined) => void;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
  data: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon | undefined;
};

const DesktopView = ({
  inputType,
  mapConfig,
  mapLayers,
  onMapInit,
  handleSinglePointChange,
  handleMultiPointChange,
  mapView,
  data,
}: Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });
  const isWebMap = !!mapConfig?.data.attributes.esri_web_map_id;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const layerCount = mapConfig?.data?.attributes?.layers?.length || 0;

  // Create refs for custom UI elements
  const resetButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
  const undoButtonRef: React.RefObject<HTMLDivElement> = React.createRef();
  const instructionRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Create refs for dragging/editing a user's points on the map
  const pointBeingDragged = useRef<Graphic | null>(null);
  const temporaryDragGraphic = useRef<Graphic | null>(null);

  // Add the custom UI elements to the map
  useEffect(() => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    mapView?.ui?.add(instructionRef?.current || '', 'bottom-left');

    if (isLineOrPolygonInput(inputType)) {
      // Show these buttons in sequence for line/polygon inputs
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapView?.ui?.add(undoButtonRef?.current || '', 'top-right');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
      return;
    } else {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      mapView?.ui?.add(resetButtonRef?.current || '', 'top-right');
    }
  }, [inputType, instructionRef, mapView?.ui, resetButtonRef, undoButtonRef]);

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
        isMobileOrSmaller: false,
      });
    } else {
      // Clear the map if there is no data
      clearPointData(mapView, setAddress);
    }
  }, [data, inputType, locale, mapView, theme]);

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

  // Handle typed address input
  const handleLocationInputChange = (point: Point | undefined) => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    inputType === 'point' && handleSinglePointChange?.(point);
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
      });
  }, [data, handleMultiPointChange, inputType, mapView, theme]);

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        mb="8px"
        style={{ cursor: 'pointer' }}
      >
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
              center: getInitialMapCenter(inputType, mapConfig, data),
              showLegend: isWebMap || layerCount > 0,
              showLegendExpanded: false,
              showLayerVisibilityControl: isWebMap || layerCount > 0,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            onClick={onMapClick}
          />
          {isLineOrPolygonInput(inputType) && data && (
            <RemoveAnswerButton
              mapView={mapView}
              handleMultiPointChange={handleMultiPointChange}
            />
          )}
          <Box>
            {isLineOrPolygonInput(inputType) && (
              <UndoButton
                handleMultiPointChange={handleMultiPointChange}
                mapView={mapView}
                undoButtonRef={undoButtonRef}
                undoEnabled={!isEmpty(data)}
                inputType={inputType}
                width="32px"
                height="32px"
                padding="7px"
                iconSize="20px"
                iconColor={colors.coolGrey500}
                bgHoverColor={colors.grey100}
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
    </>
  );
};

export default DesktopView;
