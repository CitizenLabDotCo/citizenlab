import React from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import { IMapConfig } from 'api/map_config/types';

import messages from 'containers/Admin/CustomMapConfigPage/messages';

import { goToMapLocation } from 'components/EsriMap/utils';

import { useIntl } from 'utils/cl-intl';

type Props = {
  mapView?: MapView | null;
  mapConfig?: IMapConfig | null;
};

const ResetMapViewButton = ({ mapConfig, mapView }: Props) => {
  const { formatMessage } = useIntl();

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

  return (
    <Box zIndex="999999">
      <Box
        zIndex="1000"
        mt="-72px"
        ml="16px"
        w="36px"
        background={colors.white}
      >
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
              iconColor={colors.coolGrey500}
              bgHoverColor={colors.grey100}
              borderRadius="0px"
              padding="7px"
              boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
              onClick={goToDefaultMapView}
              aria-label={formatMessage(messages.goToDefaultMapView)}
            />
          </div>
        </Tippy>
      </Box>
    </Box>
  );
};

export default ResetMapViewButton;
