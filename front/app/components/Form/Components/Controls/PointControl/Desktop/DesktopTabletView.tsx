import React, { useCallback, useEffect, useState } from 'react';

import Layer from '@arcgis/core/layers/Layer';
import MapView from '@arcgis/core/views/MapView';
import { Box } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
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
import { clearPointData, handleDataPointChange } from '../utils';

type Props = {
  mapConfig?: IMapConfig;
  mapLayers?: Layer[];
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
  didBlur: boolean;
};

const DesktopView = ({
  data,
  path,
  errors,
  mapConfig,
  mapLayers,
  onMapInit,
  handlePointChange,
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

  // When the location point changes, update the address and show a pin on the map
  useEffect(() => {
    if (data) {
      handleDataPointChange({
        data,
        mapView,
        locale,
        tenantPrimaryColor: theme.colors.tenantPrimary,
        setAddress,
      });
    } else {
      clearPointData(mapView, setAddress);
    }
  }, [data, locale, mapView, theme.colors.tenantPrimary]);

  const onMapClick = useCallback(
    (event: any, mapView: MapView) => {
      // Center the clicked location on the map
      goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(() => {
        // Update the form data
        handlePointChange(esriPointToGeoJson(event.mapPoint));
      });
    },
    [handlePointChange]
  );

  return (
    <>
      <Box display="flex" flexDirection="column" mb="8px">
        <Box mb="12px">
          <LocationTextInput
            address={address}
            handlePointChange={handlePointChange}
          />
        </Box>
        <>
          <EsriMap
            id="e2e-point-control-map"
            height="400px"
            layers={mapLayers}
            initialData={{
              zoom: Number(mapConfig?.data.attributes.zoom_level),
              center: data || mapConfig?.data.attributes.center_geojson,
              showLegend: true,
              showLayerVisibilityControl: true,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
            onClick={onMapClick}
          />
          <ResetMapViewButton mapConfig={mapConfig} mapView={mapView} />
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
