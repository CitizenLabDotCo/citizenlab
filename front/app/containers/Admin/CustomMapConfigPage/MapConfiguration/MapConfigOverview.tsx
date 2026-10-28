import React, { memo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Box, Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IMapConfig } from 'api/map_config/types';

import { SectionTitle } from 'components/admin/Section';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import { ViewOptions } from '..';
import MapLayerConfig from '../LayerConfiguration/MapLayerConfig';
import MapLayersList from '../LayerConfiguration/MapLayersList';
import messages from '../messages';

import MapCenterAndZoomConfig from './MapCenterAndZoomConfig';

const Container = styled.div``;

const Header = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 40px;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledSectionTitle = styled(SectionTitle)`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const StyledMapLayersList = styled(MapLayersList)`
  margin-bottom: 80px;
`;

const StyledMapCenterAndZoomConfig = styled(MapCenterAndZoomConfig)``;

interface Props {
  mapView?: MapView | null;
  mapConfig: IMapConfig;
  className?: string;
  setView: (view: ViewOptions) => void;
  variant?: 'default' | 'bo';
}

const MapConfigOverview = memo<Props>(
  ({ className, mapConfig, setView, mapView, variant = 'default' }) => {
    const [editedMapLayerId, setEditedMapLayerId] = useState<string | null>(
      null
    );

    const openLayerConfig = (layerId: string) => {
      setEditedMapLayerId(layerId);
    };

    const closeLayerConfig = () => {
      setEditedMapLayerId(null);
    };

    const isProjectMapPage = window.location.pathname.endsWith('/map');

    return (
      <Container className={className || ''}>
        {variant === 'bo' ? (
          <Box display="flex" flexDirection="column" gap="8px" mb="24px">
            <Text variant="boHelper" m="0">
              <FormattedMessage {...messages.mapConfigurationDescription} />
            </Text>
            <Warning variant="bo">
              <FormattedMessage {...messages.mapLocationWarning} />
            </Warning>
          </Box>
        ) : (
          <Header>
            {isProjectMapPage && ( // Show only on project map configuration
              <TitleContainer>
                <StyledSectionTitle>
                  <FormattedMessage {...messages.mapConfigurationTitle} />
                </StyledSectionTitle>
              </TitleContainer>
            )}
            <Text color="textSecondary">
              <FormattedMessage {...messages.mapConfigurationDescription} />
            </Text>
            {isProjectMapPage && ( // Show only on project map configuration
              <Warning>
                <FormattedMessage {...messages.mapLocationWarning} />
              </Warning>
            )}
          </Header>
        )}

        {!editedMapLayerId ? (
          <>
            <StyledMapLayersList
              onEditLayer={openLayerConfig}
              setView={setView}
              mapConfig={mapConfig}
              variant={variant}
            />
            <StyledMapCenterAndZoomConfig
              mapView={mapView}
              mapConfig={mapConfig}
              variant={variant}
            />
          </>
        ) : (
          <MapLayerConfig
            mapLayerId={editedMapLayerId}
            onClose={closeLayerConfig}
            mapConfig={mapConfig}
          />
        )}
      </Container>
    );
  }
);

export default MapConfigOverview;
