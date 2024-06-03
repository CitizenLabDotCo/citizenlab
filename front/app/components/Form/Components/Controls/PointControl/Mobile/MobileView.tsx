import React, { useEffect, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box } from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { parseLayers } from 'components/EsriMap/utils';
import { Option } from 'components/UI/LocationInput';

import { sanitizeForClassname } from 'utils/JSONFormUtils';

import ErrorDisplay from '../../../ErrorDisplay';
import LocationTextInput from '../components/LocationTextInput';
import MapOverlay from '../components/MapOverlay';
import { clearPointData, handleDataPointChange } from '../utils';

import FullscreenMapInput from './FullscreenMapInput';

type Props = {
  mapConfig?: IMapConfig;
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
  didBlur: boolean;
};

const MobileView = ({
  mapConfig,
  onMapInit,
  mapView,
  handlePointChange,
  didBlur,
  id,
  ...props
}: Props & ControlProps) => {
  const { data, path, errors } = props;

  const theme = useTheme();
  const locale = useLocale();
  const localize = useLocalize();

  // state variables
  const [showFullscreenMapInput, setShowFullscreenMap] = useState(false);
  const [showMapOverlay, setShowMapOverlay] = useState(true);
  const [address, setAddress] = useState<Option>({
    value: '',
    label: '',
  });

  // Create map layers from map configuration to load in
  const mapLayers = useMemo(() => {
    return parseLayers(mapConfig, localize);
  }, [localize, mapConfig]);

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
        <Box position="relative">
          <MapOverlay
            showMapOverlay={showMapOverlay}
            handleShowFullscreenMap={() => {
              setShowFullscreenMap(true);
            }}
          />
          <EsriMap
            id="mobilePreviewMap"
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
      </Box>
      <ErrorDisplay
        inputId={sanitizeForClassname(id)}
        ajvErrors={errors}
        fieldPath={path}
        didBlur={didBlur}
      />
      {showFullscreenMapInput && (
        <FullscreenMapInput
          setShowFullscreenMap={setShowFullscreenMap}
          mapConfig={mapConfig}
          handlePointChange={handlePointChange}
          {...props}
        />
      )}
    </>
  );
};

export default MobileView;
