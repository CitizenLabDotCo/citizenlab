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
import { esriPointToGeoJson, goToMapLocation } from 'components/EsriMap/utils';
import { Option } from 'components/UI/LocationInput';

import { sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../../../ErrorDisplay';
import LocationTextInput from '../components/LocationTextInput';
import UndoButton from '../components/UndoButton';
import {
  clearPointData,
  handleDataPointChange,
  handleDataMultipointChange,
  getUserInputPoints,
} from '../utils';

type Props = {
  mapConfig?: IMapConfig;
  inputType: 'point' | 'line' | 'polygon';
  mapLayers?: Layer[];
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handlePointChange?: (point: GeoJSON.Point | undefined) => void;
  handleMultiPointChange?: (points: GeoJSON.Point[] | undefined) => void;

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
}: ControlProps & Props) => {
  const theme = useTheme();
  const locale = useLocale();
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });

  useEffect(() => {
    // Add custom buttons to map interface
    mapView?.ui.add(
      document.getElementById(`undo-button-${id}`) || '',
      'bottom-left'
    );
    mapView?.ui.add(
      document.getElementById(`reset-view-${id}`) || '',
      'bottom-left'
    );
  }, [mapView, id]);

  // Show graphics on map when location point(s) change
  useEffect(() => {
    if (data) {
      if (inputType === 'point') {
        handleDataPointChange({
          data,
          mapView,
          locale,
          tenantPrimaryColor: theme.colors.tenantPrimary,
          setAddress,
        });
      } else if (inputType === 'line' || inputType === 'polygon') {
        handleDataMultipointChange({
          data,
          mapView,
          inputType,
          tenantPrimaryColor: theme.colors.tenantPrimary,
        });
      }
    } else {
      clearPointData(mapView, setAddress);
    }
  }, [data, id, inputType, locale, mapView, theme.colors.tenantPrimary]);

  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      if (inputType === 'point') {
        // Center the clicked location on the map
        goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(
          () => {
            // Update the form data
            handlePointChange?.(esriPointToGeoJson(event.mapPoint));
          }
        );
      } else if (inputType === 'line' || inputType === 'polygon') {
        // Add the clicked location to the existing points
        const newPoint = esriPointToGeoJson(event.mapPoint);
        const currentPointsGeoJSON = getUserInputPoints(mapView);
        // Update the form data
        handleMultiPointChange?.([...currentPointsGeoJSON, newPoint]);
      }
    },
    [handleMultiPointChange, handlePointChange, inputType]
  );

  const handleLocationInputChange = (point: Point | undefined) => {
    if (handlePointChange) {
      handlePointChange(point);
    } else if (handleMultiPointChange) {
      point ? handleMultiPointChange([point]) : handleMultiPointChange([]);
    }
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
          {(inputType === 'line' || inputType === 'polygon') && (
            <UndoButton
              handleMultiPointChange={handleMultiPointChange}
              mapView={mapView}
              id={id}
              undoEnabled={data}
            />
          )}

          <EsriMap
            id="e2e-point-control-map"
            height="400px"
            layers={mapLayers}
            initialData={{
              zoom: Number(mapConfig?.data.attributes.zoom_level),
              center:
                inputType === 'point'
                  ? data || mapConfig?.data.attributes.center_geojson
                  : mapConfig?.data.attributes.center_geojson,
              showLegend: true,
              showLayerVisibilityControl: true,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            onClick={onMapClick}
          />
          <ResetMapViewButton id={id} mapConfig={mapConfig} mapView={mapView} />
        </>
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
    </>
  );
};

export default DesktopView;
