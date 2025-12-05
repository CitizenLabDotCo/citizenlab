import React, { useEffect, useMemo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import EsriMap from 'components/EsriMap';
import { parseLayers } from 'components/EsriMap/utils';
import { Option } from 'components/UI/LocationInput';

import LocationTextInput from '../components/LocationTextInput';
import MapOverlay from '../components/MapOverlay';
import RemoveAnswerButton from '../components/RemoveAnswerButton';
import {
  isLineOrPolygonInput,
  updateMultiPointsDataAndDisplay,
  getCoordinatesFromMultiPointData,
} from '../multiPointUtils';
import { updatePointDataAndDisplay, clearPointData } from '../pointUtils';
import {
  getInitialMapCenter,
  getUserInputGraphicsLayer,
  MapInputType,
} from '../utils';

import FullscreenMapInput from './FullscreenMapInput';

type Props = {
  mapConfig?: IMapConfig;
  onMapInit?: (mapView: MapView) => void;
  mapView?: MapView | null;
  handleSinglePointChange: (point: GeoJSON.Point | undefined) => void;
  handleMultiPointChange?: (points: number[][] | undefined) => void;
  inputType: MapInputType;
  data?: GeoJSON.Point | GeoJSON.LineString | GeoJSON.Polygon | undefined;
};

const MobileView = ({
  mapConfig,
  onMapInit,
  mapView,
  handleSinglePointChange,
  handleMultiPointChange,
  inputType,
  data,
}: Props) => {
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

  // Show graphics on map when location point(s) change
  useEffect(() => {
    if (data) {
      if (inputType === 'point') {
        updatePointDataAndDisplay({
          data,
          mapView,
          locale,
          tenantPrimaryColor: theme.colors.tenantPrimary,
          setAddress,
        });
      } else if (isLineOrPolygonInput(inputType)) {
        updateMultiPointsDataAndDisplay({
          data: getCoordinatesFromMultiPointData(data, inputType),
          mapView,
          inputType,
          tenantPrimaryColor: theme.colors.tenantPrimary,
          zoomToInputExtent: true,
        });
      }
      setShowMapOverlay(false);
    } else {
      clearPointData(mapView, setAddress);
      setShowMapOverlay(true);
    }
  }, [data, inputType, locale, mapView, theme.colors.tenantPrimary]);

  // If there is a user input, zoom to the extent of the drawing
  useEffect(
    () => {
      const graphicsLayer = getUserInputGraphicsLayer(mapView);
      if (graphicsLayer?.graphics) {
        mapView?.goTo(graphicsLayer.graphics);
      }
    }, // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    [mapView, mapView?.map?.layers]
  );

  return (
    <>
      <Box display="flex" flexDirection="column" mb="8px">
        <Box mb="12px" zIndex="10">
          {inputType === 'point' && (
            <LocationTextInput
              address={address}
              handlePointChange={handleSinglePointChange}
            />
          )}
        </Box>
        <Box position="relative">
          <MapOverlay
            showMapOverlay={showMapOverlay}
            inputType={inputType}
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
              center: getInitialMapCenter(inputType, mapConfig, data),
              showLegend: false,
              showLayerVisibilityControl: false,
              showZoomControls: false,
              onInit: onMapInit,
            }}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
          />
          {isLineOrPolygonInput(inputType) && data && (
            <RemoveAnswerButton
              mapView={mapView}
              handleMultiPointChange={handleMultiPointChange}
            />
          )}
        </Box>
      </Box>

      {showFullscreenMapInput && (
        <FullscreenMapInput
          setShowFullscreenMap={setShowFullscreenMap}
          mapConfig={mapConfig}
          handleSinglePointChange={handleSinglePointChange}
          handleMultiPointChange={handleMultiPointChange}
          inputType={inputType}
          mapViewSurveyPage={mapView}
          questionPageMapView={mapView}
          data={data}
        />
      )}
    </>
  );
};

export default MobileView;
