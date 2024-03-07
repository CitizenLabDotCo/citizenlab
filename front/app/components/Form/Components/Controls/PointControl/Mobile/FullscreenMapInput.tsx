import React, { memo, useCallback, useEffect, useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Label,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import EsriMap from 'components/EsriMap';
import { IMapConfig } from 'api/map_config/types';
import MapView from '@arcgis/core/views/MapView';
import Layer from '@arcgis/core/layers/Layer';
import { ControlProps } from '@jsonforms/core';
import { FormLabel } from 'components/UI/FormComponents';
import { sanitizeForClassname, getLabel } from 'utils/JSONFormUtils';
import messages from '../../messages';
import { useIntl } from 'utils/cl-intl';
import { esriPointToGeoJson, goToMapLocation } from 'components/EsriMap/utils';
import { Option } from 'components/UI/LocationInput';
import useLocale from 'hooks/useLocale';
import { useTheme } from 'styled-components';
import LocationTextInput from '../components/LocationTextInput';
import { clearPointData, handleDataPointChange } from '../utils';

type Props = {
  setShowFullscreenMap: (show: boolean) => void;
  mapConfig: IMapConfig;
  data: any;
  mapLayers: Layer[] | undefined;
  handlePointChange: (point: GeoJSON.Point | undefined) => void;
};

const FullscreenMapInput = memo<Props>(
  ({
    setShowFullscreenMap,
    mapConfig,
    mapLayers,
    data,
    handlePointChange,
    ...props
  }: ControlProps & Props) => {
    const { uischema, path, id, schema, required } = props;

    const theme = useTheme();
    const locale = useLocale();
    const { formatMessage } = useIntl();
    const screenHeight = window.innerHeight;
    const isTabletOrSmaller = useBreakpoint('tablet');

    // State variables
    const [mapView, setMapView] = useState<MapView | null>(null);
    const [address, setAddress] = useState<Option>({
      value: '',
      label: '',
    });

    // On mapInit, persist the mapView in state
    const onMapInit = useCallback((mapView: MapView) => {
      setMapView(mapView);
    }, []);

    // When the user clicks on the map, update the form data
    const onMapClick = useCallback(
      (event: any, mapView: MapView) => {
        // Center the clicked location on the map
        goToMapLocation(esriPointToGeoJson(event.mapPoint), mapView).then(
          () => {
            // Update the form data
            handlePointChange(esriPointToGeoJson(event.mapPoint));
          }
        );
      },
      [handlePointChange]
    );

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
      } else {
        clearPointData(mapView, setAddress);
      }
    }, [data, locale, mapView, theme.colors.tenantPrimary]);

    return (
      <Box
        width="100vw"
        height="100vh"
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
            height={`${screenHeight * 0.65}px`}
            layers={mapLayers}
            initialData={{
              zoom: Number(mapConfig?.data.attributes.zoom_level),
              center: data || mapConfig?.data.attributes.center_geojson,
              showLegend: true,
              showLayerVisibilityControl: true,
              showZoomControls: true,
              onInit: onMapInit,
            }}
            onClick={onMapClick}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
          />
          <Box m="16px" height="100%" background="white">
            <Box>
              <FormLabel
                htmlFor={sanitizeForClassname(id)}
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
                    {isTabletOrSmaller
                      ? formatMessage(messages.tapOnMapToAdd)
                      : formatMessage(messages.clickOnMapToAdd)}
                  </Box>
                </Box>
              </Label>
              <LocationTextInput
                address={address}
                handlePointChange={handlePointChange}
              />
            </Box>
            <Box
              borderTop={`1px solid ${colors.grey400}`}
              p="20px"
              gap="16px"
              display="flex"
              position="absolute"
              bottom="0"
              width="100vw"
              justifyContent="flex-end"
            >
              <Button
                icon="arrow-left"
                buttonStyle="secondary"
                onClick={() => {
                  setShowFullscreenMap(false);
                }}
              >
                {formatMessage(messages.back)}
              </Button>
              <Button
                mr="20px"
                onClick={() => {
                  setShowFullscreenMap(false);
                }}
                disabled={!data || data?.address === ''}
              >
                {formatMessage(messages.confirm)}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default FullscreenMapInput;
