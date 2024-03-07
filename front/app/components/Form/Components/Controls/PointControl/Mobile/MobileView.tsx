import React, { useEffect, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { useTheme } from 'styled-components';
import { Option } from 'components/UI/LocationInput';

import Layer from '@arcgis/core/layers/Layer';
import useLocale from 'hooks/useLocale';

import EsriMap from 'components/EsriMap';
import ErrorDisplay from '../../../ErrorDisplay';
import FullscreenMapInput from './FullscreenMapInput';
import { IMapConfig } from 'api/map_config/types';
import { clearPointData, handleDataPointChange } from '../utils';
import LocationTextInput from '../components/LocationTextInput';
import MapOverlay from '../components/MapOverlay';

type Props = {
  mapConfig?: IMapConfig;
  mapLayers?: Layer[];
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
  didBlur: boolean;
};

const MobileView = ({
  mapConfig,
  mapLayers,
  onMapInit,
  mapView,
  handlePointChange,
  didBlur,
  ...props
}: Props & ControlProps) => {
  const { data, path, errors } = props;

  const theme = useTheme();
  const locale = useLocale();

  // state variables
  const [showFullscreenMapInput, setShowFullscreenMap] = useState(false);
  const [showMapOverlay, setShowMapOverlay] = useState(true);
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });

  // When the data (point) changes, update the address and add a pin to the map
  useEffect(() => {
    if (data) {
      handleDataPointChange({
        data,
        mapView,
        locale,
        tenantPrimaryColor: theme.colors.tenantPrimary,
        setAddress,
      });
      setShowMapOverlay(false);
    } else {
      clearPointData(mapView, setAddress);
      setShowMapOverlay(true);
    }
  }, [data, locale, mapView, theme.colors.tenantPrimary]);

  return (
    <>
      <Box display="flex" flexDirection="column" mb="8px">
        <Box mb="12px" zIndex="10">
          <LocationTextInput
            address={address}
            handlePointChange={handlePointChange}
          />
        </Box>
        {mapConfig && (
          <Box position="relative">
            <MapOverlay
              showMapOverlay={showMapOverlay}
              handleShowFullscreenMap={() => {
                setShowFullscreenMap(true);
              }}
            />
            <EsriMap
              height="180px"
              layers={mapLayers}
              initialData={{
                zoom: Number(mapConfig?.data.attributes.zoom_level),
                center: data || mapConfig?.data.attributes.center_geojson,
                showLegend: false,
                showLayerVisibilityControl: false,
                showZoomControls: false,
                onInit: onMapInit,
              }}
              webMapId={mapConfig?.data.attributes.esri_web_map_id}
            />
          </Box>
        )}
      </Box>
      <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
      {showFullscreenMapInput && mapView && mapConfig && (
        <FullscreenMapInput
          setShowFullscreenMap={setShowFullscreenMap}
          mapConfig={mapConfig}
          mapLayers={mapLayers}
          handlePointChange={handlePointChange}
          {...props}
        />
      )}
    </>
  );
};

export default MobileView;
