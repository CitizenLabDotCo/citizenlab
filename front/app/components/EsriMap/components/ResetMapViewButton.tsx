import React from 'react';

import Point from '@arcgis/core/geometry/Point';
import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Button,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IMapConfig } from 'api/map_config/types';

import messages from 'containers/Admin/CustomMapConfigPage/messages';

import { esriPointToGeoJson, goToMapLocation } from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';

type Props = {
  mapView?: MapView | null;
  mapConfig?: IMapConfig | null;
};

const ResetMapViewButton = ({ mapConfig, mapView }: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();

  const goToDefaultMapView = () => {
    // Get global values for fallback
    const globalDefaultCenterPoint =
      appConfig?.data.attributes.settings.maps?.map_center;
    const globalDefaultZoom =
      appConfig?.data.attributes.settings.maps?.zoom_level;

    // Get the center point from the map config or use the global default
    const centerPoint =
      mapConfig?.data.attributes.center_geojson ||
      esriPointToGeoJson(
        new Point({
          latitude: Number(globalDefaultCenterPoint?.lat),
          longitude: Number(globalDefaultCenterPoint?.long),
        })
      );

    if (mapView && centerPoint) {
      goToMapLocation(
        centerPoint,
        mapView,
        Number(mapConfig?.data.attributes.zoom_level || globalDefaultZoom)
      );
    }
  };

  return (
    <Box zIndex="999999">
      <Box
        zIndex="1000"
        mt="-72px"
        ml="16px"
        w="36px"
        background={colors.white}
      >
        <Tooltip
          maxWidth="250px"
          placement="right"
          content={formatMessage(messages.goToDefaultMapView)}
          hideOnClick={true}
        >
          <div>
            <Button
              icon="gps"
              buttonStyle="white"
              iconColor={colors.coolGrey500}
              bgHoverColor={colors.grey100}
              borderRadius="0px"
              padding="7px"
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
              onClick={goToDefaultMapView}
              aria-label={formatMessage(messages.goToDefaultMapView)}
            />
          </div>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ResetMapViewButton;
