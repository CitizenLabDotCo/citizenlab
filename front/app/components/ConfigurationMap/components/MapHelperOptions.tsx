import React from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IMapConfig } from 'api/map_config/types';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import messages from 'containers/Admin/CustomMapConfigPage/messages';

import { goToMapLocation } from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';

const GoToDefaultViewportButtonWrapper = styled.div`
  position: absolute;
  bottom: 30px;
  left: 11px;
  z-index: 1000;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
`;

const SetAsDefaultViewportButtonWrapper = styled.div`
  position: absolute;
  bottom: 30px;
  left: 64px;
  z-index: 1000;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
`;

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
    if (mapView?.center.longitude && mapView?.center.latitude) {
      updateMapConfig({
        mapConfigId: mapConfig?.data.id,
        center_geojson: {
          type: 'Point',
          coordinates: [mapView.center.longitude, mapView.center.latitude],
        },
        zoom_level: mapView?.zoom.toString(),
      });
    }
  };

  return (
    <Box>
      <GoToDefaultViewportButtonWrapper>
        <Tippy
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
        </Tippy>
      </GoToDefaultViewportButtonWrapper>
      <SetAsDefaultViewportButtonWrapper>
        <Tippy
          maxWidth="250px"
          placement="right"
          content={formatMessage(messages.setAsDefaultMapView)}
          hideOnClick={true}
        >
          <div>
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
        </Tippy>
      </SetAsDefaultViewportButtonWrapper>
    </Box>
  );
};

export default MapHelperOptions;
