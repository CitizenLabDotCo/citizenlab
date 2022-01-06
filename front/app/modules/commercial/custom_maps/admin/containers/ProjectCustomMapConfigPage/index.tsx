import React, { memo, useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { isEqual } from 'lodash-es';
import { combineLatest } from 'rxjs';

// components
import Map from 'components/Map';
import MapConfigOverview from './MapConfigOverview';
import { Spinner } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Tippy from '@tippyjs/react';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from '../../../hooks/useMapConfig';

// services
import {
  createProjectMapConfig,
  updateProjectMapConfig,
} from '../../../services/mapConfigs';

// events
import {
  leafletMapCenter$,
  leafletMapZoom$,
  setLeafletMapCenter,
  setLeafletMapZoom,
} from 'components/UI/LeafletMap/events';

// utils
import { getCenter, getZoomLevel, getTileProvider } from '../../../utils/map';
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
  margin-left: 60px;
  position: relative;
`;

const GoToDefaultViewportButtonWrapper = styled.div`
  position: absolute;
  top: 80px;
  left: 11px;
  z-index: 1000;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const SetAsDefaultViewportButtonWrapper = styled.div`
  position: absolute;
  top: 122px;
  left: 11px;
  z-index: 1000;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

interface Props {
  className?: string;
}

const ProjectCustomMapConfigPage = memo<
  Props & WithRouterProps & InjectedIntlProps
>(({ params: { projectId }, className, intl: { formatMessage } }) => {
  const appConfig = useAppConfiguration();
  const mapConfig = useMapConfig({ projectId });

  const defaultLatLng = getCenter(undefined, appConfig, mapConfig);
  const defaultLat = defaultLatLng[0];
  const defaultLng = defaultLatLng[1];
  const defaultZoom = getZoomLevel(undefined, appConfig, mapConfig);
  const defaultTileProvider = getTileProvider(appConfig, mapConfig);

  const [currentLat, setCurrentLat] = useState<number | undefined>(undefined);
  const [currentLng, setCurrentLng] = useState<number | undefined>(undefined);
  const [currentZoom, setCurrentZoom] = useState<number | null>(null);

  const disabled = isEqual(
    [defaultLat.toFixed(4), defaultLng.toFixed(4), defaultZoom],
    [currentLat?.toFixed(4), currentLng?.toFixed(4), currentZoom]
  );

  useEffect(() => {
    const subscriptions = [
      combineLatest([leafletMapCenter$, leafletMapZoom$]).subscribe(
        ([center, zoom]) => {
          setCurrentLat(center?.[0]);
          setCurrentLng(center?.[1]);
          setCurrentZoom(zoom);
        }
      ),
    ];

    return () =>
      subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, []);

  const goToDefaultMapView = () => {
    setLeafletMapCenter([defaultLat, defaultLng]);
    setLeafletMapZoom(defaultZoom);
  };

  const setAsDefaultMapView = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      mapConfig &&
      currentLat !== undefined &&
      currentLng !== undefined &&
      currentZoom !== null
    ) {
      updateProjectMapConfig(projectId, mapConfig.id, {
        center_geojson: {
          type: 'Point',
          coordinates: [currentLng, currentLat],
        },
        zoom_level: currentZoom.toString(),
      });
    }
  };

  useEffect(() => {
    // create project mapConfig if it doesn't yet exist
    if (projectId && !isNilOrError(appConfig) && mapConfig === null) {
      createProjectMapConfig(projectId, {
        tile_provider: defaultTileProvider,
        center_geojson: {
          type: 'Point',
          coordinates: [defaultLng, defaultLat],
        },
        zoom_level: defaultZoom.toString(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, appConfig, mapConfig]);

  if (projectId && mapConfig?.id) {
    return (
      <Container className={className || ''}>
        <StyledMapConfigOverview projectId={projectId} />
        <MapWrapper>
          <Map projectId={projectId} hideLegend={false} />
          <GoToDefaultViewportButtonWrapper>
            <Tippy
              maxWidth="250px"
              placement="right"
              content={formatMessage(messages.goToDefaultMapView)}
              hideOnClick={true}
              disabled={disabled}
            >
              <div>
                <Button
                  icon="mapCenter"
                  buttonStyle="white"
                  padding="7px"
                  boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
                  onClick={goToDefaultMapView}
                  disabled={disabled}
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
              disabled={disabled}
            >
              <div>
                <Button
                  icon="save"
                  buttonStyle="white"
                  padding="7px"
                  boxShadow="0px 2px 2px rgba(0, 0, 0, 0.2)"
                  onClick={setAsDefaultMapView}
                  disabled={disabled}
                />
              </div>
            </Tippy>
          </SetAsDefaultViewportButtonWrapper>
        </MapWrapper>
      </Container>
    );
  }

  return (
    <Loading>
      <Spinner />
    </Loading>
  );
});

export default withRouter(injectIntl(ProjectCustomMapConfigPage));
