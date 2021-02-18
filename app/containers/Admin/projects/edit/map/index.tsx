import React, { memo, useEffect, useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Map from 'components/Map';
import LayerList from './LayerList';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useMapConfig from 'hooks/useMapConfig';

// services
import { createProjectMapConfig } from 'services/mapConfigs';

// utils
import { getCenter, getZoomLevel, getTileProvider } from 'utils/map';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { mapCenter$, mapZoom$ } from 'components/Map/events';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
`;

const StyledLayerList = styled(LayerList)`
  flex: 0 0 400px;
  width: 400px;
`;

const MapWrapper = styled.div`
  flex: 1;
  margin-left: 60px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const StyledMap = styled(Map)`
  flex: 1;
  height: 800px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const FooterItemKey = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
`;

const FooterItemValue = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  margin-left: 5px;
`;

interface Props {
  className?: string;
}

const MapPage = memo<Props & WithRouterProps>(
  ({ params: { projectId }, className }) => {
    const appConfig = useAppConfiguration();
    const mapConfig = useMapConfig({ projectId });

    const [currentCenter, setCurrentCenter] = useState<string | null>(null);
    const [currentZoom, setCurrentZoom] = useState<number | null>(null);

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

    useEffect(() => {
      const subscriptions = [
        mapCenter$.subscribe((center) => {
          if (center) {
            console.log(center);
            setCurrentCenter(`${center[0]}, ${center[1]}`);
          }
        }),
        mapZoom$.subscribe((zoom) => {
          if (zoom !== null) {
            setCurrentZoom(zoom);
          }
        }),
      ];

      return () =>
        subscriptions.forEach((subscription) => subscription.unsubscribe());
    }, []);

    if (projectId) {
      return (
        <Container className={className || ''}>
          <StyledLayerList projectId={projectId} />
          <MapWrapper>
            <StyledMap projectId={projectId} hideLegend={true} />
            <Footer>
              <FooterItem>
                <FooterItemKey>
                  <FormattedMessage {...messages.currentCenterCoordinates} />:
                </FooterItemKey>
                <FooterItemValue>{currentCenter}</FooterItemValue>
              </FooterItem>
              <FooterItem>
                <FooterItemKey>
                  <FormattedMessage {...messages.currentZoomLevel} />:
                </FooterItemKey>
                <FooterItemValue>{currentZoom}</FooterItemValue>
              </FooterItem>
            </Footer>
          </MapWrapper>
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(MapPage);
