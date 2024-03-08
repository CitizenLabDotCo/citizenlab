import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import Layer from '@arcgis/core/layers/Layer';
import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Button,
  Icon,
  Label,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { ControlProps } from '@jsonforms/core';
import { useTheme } from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import useLocale from 'hooks/useLocale';

import EsriMap from 'components/EsriMap';
import { esriPointToGeoJson, goToMapLocation } from 'components/EsriMap/utils';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { sanitizeForClassname, getLabel } from 'utils/JSONFormUtils';

import messages from '../../messages';
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
    const isTabletOrSmaller = useBreakpoint('tablet');
    const clientHeight = window.innerHeight;

    // State variables
    const bottomSectionRef = useRef<HTMLDivElement>(null);
    const [mapView, setMapView] = useState<MapView | null>(null);

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
        });
      } else {
        clearPointData(mapView);
      }
    }, [data, locale, mapView, theme.colors.tenantPrimary]);

    // Get map height by calculating the height of the bottom section
    const getMapHeight = () => {
      return bottomSectionRef?.current?.clientHeight
        ? clientHeight - bottomSectionRef?.current?.clientHeight
        : clientHeight;
    };

    const handleBack = () => {
      setShowFullscreenMap(false);
    };

    return (
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
              center: data || mapConfig?.data.attributes.center_geojson,
              showLegend: true,
              showLayerVisibilityControl: true,
              showZoomControls: true,
              onInit: onMapInit,
            }}
            onClick={onMapClick}
            webMapId={mapConfig?.data.attributes.esri_web_map_id}
          />
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
                buttonStyle="secondary"
                onClick={handleBack}
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
