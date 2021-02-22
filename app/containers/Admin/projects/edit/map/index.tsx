import React, { memo, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Map from 'components/Map';
import MapConfigOverview from './MapConfigOverview';
import { Spinner } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Tippy from '@tippyjs/react';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from 'hooks/useMapConfig';

// services
import { createProjectMapConfig } from 'services/mapConfigs';

// events
import { setMapLatLngZoom } from 'components/Map/events';

// utils
import { getCenter, getZoomLevel, getTileProvider } from 'utils/map';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

const Loading = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
`;

const StyledMapConfigOverview = styled(MapConfigOverview)`
  flex: 0 0 400px;
  width: 400px;
`;

const MapWrapper = styled.div`
  flex: 1;
  height: calc(100vh - 250px);
  max-height: 800px;
  display: flex;
  margin-left: 60px;
  position: relative;
`;

const StyledMap = styled(Map)`
  flex: 1;
  height: 100%;
`;

const DefaultMapViewButtonWrapper = styled.div`
  position: absolute;
  top: 80px;
  left: 10px;
  z-index: 314159;
`;

interface Props {
  className?: string;
}

const MapPage = memo<Props & WithRouterProps & InjectedIntlProps>(
  ({ params: { projectId }, className, intl: { formatMessage } }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const goToDefaultMapView = () => {
      const defaultLatLng = getCenter(undefined, appConfig, mapConfig);
      const defaultLat = defaultLatLng[0];
      const defaultLng = defaultLatLng[1];
      const defaultZoom = getZoomLevel(undefined, appConfig, mapConfig);

      if (defaultLat && defaultLng && defaultZoom) {
        setMapLatLngZoom({
          lat: parseFloat(defaultLat),
          lng: parseFloat(defaultLng),
          zoom: defaultZoom,
        });
      }
    };

    useEffect(() => {
      // create project mapConfig if it doesn't yet exist
      if (projectId && !isNilOrError(appConfig) && mapConfig === null) {
        const zoom_level = getZoomLevel(
          undefined,
          appConfig,
          mapConfig
        ).toString();
        const center = getCenter(undefined, appConfig, mapConfig);
        const centerLat = center[0];
        const centerLong = center[1];
        const tile_provider = getTileProvider(appConfig, mapConfig);

        createProjectMapConfig(projectId, {
          zoom_level,
          tile_provider,
          center_geojson: {
            type: 'Point',
            coordinates: [centerLat, centerLong],
          },
        });
      }
    }, [projectId, appConfig, mapConfig]);

    if (projectId && mapConfig?.id) {
      return (
        <Container className={className || ''}>
          <StyledMapConfigOverview projectId={projectId} />
          <MapWrapper>
            <StyledMap projectId={projectId} hideLegend={true} />
            <DefaultMapViewButtonWrapper>
              <Tippy
                placement="right"
                content={formatMessage(messages.goToDefaultMapView)}
                hideOnClick={false}
              >
                <div>
                  <Button
                    icon="mapCenter"
                    buttonStyle="white"
                    padding="8px"
                    onClick={goToDefaultMapView}
                  />
                </div>
              </Tippy>
            </DefaultMapViewButtonWrapper>
          </MapWrapper>
        </Container>
      );
    }

    return (
      <Loading>
        <Spinner />
      </Loading>
    );
  }
);

export default withRouter(injectIntl(MapPage));
