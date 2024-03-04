import React from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import styled from 'styled-components';
import messages from '../../../containers/Admin/ProjectCustomMapConfigPage/messages';

import { useIntl } from 'utils/cl-intl';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';

import { IMapConfig } from 'api/map_config/types';
import { goToMapLocation } from 'components/EsriMap/utils';

const GoToDefaultViewportButtonWrapper = styled.div`
  position: absolute;
  top: 84px;
  left: 11px;
  z-index: 1000;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
`;

const SetAsDefaultViewportButtonWrapper = styled.div`
  position: absolute;
  top: 128px;
  left: 11px;
  z-index: 1000;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
`;

type Props = {
  mapView: MapView | null;
  mapConfig: IMapConfig;
  projectId: string;
};

const MapHelperOptions = ({ mapView, mapConfig, projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: updateProjectMapConfig } = useUpdateMapConfig();

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
    if ((mapView?.center.longitude, mapView?.center.latitude)) {
      updateProjectMapConfig({
        projectId,
        id: mapConfig?.data.id,
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
            />
          </div>
        </Tippy>
      </SetAsDefaultViewportButtonWrapper>
    </Box>
  );
};

export default MapHelperOptions;
