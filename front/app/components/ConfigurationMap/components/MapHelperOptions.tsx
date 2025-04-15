import React from 'react';

import MapView from '@arcgis/core/views/MapView';
import {
  Box,
  Button,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { IMapConfig } from 'api/map_config/types';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import messages from 'containers/Admin/CustomMapConfigPage/messages';

import { goToMapLocation } from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';
import { getMapZoom, projectPointToWebMercator } from 'utils/mapUtils/map';

type Props = {
  mapView: MapView | null;
  mapConfig: IMapConfig;
};

const MapHelperOptions = ({ mapConfig, mapView }: Props) => {
  const { projectId } = useParams() as {
    projectId: string;
  };

  const { formatMessage } = useIntl();
  const { mutateAsync: updateMapConfig } = useUpdateMapConfig(projectId);

  const goToDefaultMapView = () => {
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const centerPoint = mapConfig?.data.attributes.center_geojson;
    if (mapView && centerPoint) {
      goToMapLocation(
        centerPoint,
        mapView,
        Number(mapConfig.data.attributes.zoom_level)
      );
    }
  };

  const setAsDefaultMapView = () => {
    if (!mapView) return;

    // Project the point to Web Mercator, in case the map is using a different projection
    const projectedPoint = projectPointToWebMercator(mapView.center);

    if (projectedPoint.longitude && projectedPoint.latitude) {
      updateMapConfig({
        mapConfigId: mapConfig.data.id,
        center_geojson: {
          type: 'Point',
          coordinates: [projectedPoint.longitude, projectedPoint.latitude],
        },

        zoom_level: getMapZoom(mapView.zoom, mapView.scale),
      });
    }
  };

  return (
    <Box>
      <Box
        position="absolute"
        bottom="30px"
        left="12px"
        zIndex="1000"
        background={colors.white}
        borderRadius="3px"
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
              padding="7px"
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
              onClick={goToDefaultMapView}
            />
          </div>
        </Tooltip>
      </Box>
      <Box
        position="absolute"
        bottom="30px"
        left="64px"
        zIndex="1000"
        background={colors.white}
        borderRadius="3px"
      >
        <Tooltip
          maxWidth="250px"
          placement="right"
          content={formatMessage(messages.setAsDefaultMapView)}
          hideOnClick={true}
        >
          <div id="e2e-save-current-extent">
            <Button
              icon="save"
              buttonStyle="white"
              padding="7px"
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
              onClick={setAsDefaultMapView}
              text={formatMessage(messages.saveZoom)}
              textColor={colors.coolGrey600}
            />
          </div>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default MapHelperOptions;
