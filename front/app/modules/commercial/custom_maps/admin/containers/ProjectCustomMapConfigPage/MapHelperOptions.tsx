import React from 'react';

// components
import MapView from '@arcgis/core/views/MapView';
import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// utils
import styled from 'styled-components';
import messages from './messages';

// hooks
import { useIntl } from 'utils/cl-intl';
import useUpdateMapConfig from 'modules/commercial/custom_maps/api/map_config/useUpdateMapConfig';

// types
import { IMapConfig } from 'modules/commercial/custom_maps/api/map_config/types';

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
    mapView?.goTo(
      {
        center: [centerPoint?.coordinates[0], centerPoint?.coordinates[1]],
        zoom: mapConfig?.data.attributes.zoom_level,
      },
      { duration: 500 }
    );
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
