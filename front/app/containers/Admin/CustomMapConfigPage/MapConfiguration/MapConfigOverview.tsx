import React, { memo, useState } from 'react';

// components
import MapLayersList from '../LayerConfiguration/MapLayersList';
import MapLayerConfig from '../LayerConfiguration/MapLayerConfig';
import MapCenterAndZoomConfig from './MapCenterAndZoomConfig';
import { SectionTitle } from 'components/admin/Section';
import Warning from 'components/UI/Warning';
import { Text } from '@citizenlab/cl2-component-library';
import MapView from '@arcgis/core/views/MapView';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { ViewOptions } from '..';
import { IMapConfig } from 'api/map_config/types';

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
}

const MapConfigOverview = memo<Props>(
  ({ className, mapConfig, setView, mapView }) => {
    const [editedMapLayerId, setEditedMapLayerId] = useState<string | null>(
      null
    );

    const openLayerConfig = (layerId: string) => {
      setEditedMapLayerId(layerId);
    };

    const closeLayerConfig = () => {
      setEditedMapLayerId(null);
    };

    return (
      <Container className={className || ''}>
        <Header>
          {!mapConfig && ( // Show only on project map configuration
            <TitleContainer>
              <StyledSectionTitle>
                <FormattedMessage {...messages.mapConfigurationTitle} />
              </StyledSectionTitle>
            </TitleContainer>
          )}
          <Text color="textSecondary">
            <FormattedMessage {...messages.mapConfigurationDescription} />
          </Text>
          {!mapConfig && ( // Show only on project map configuration
            <Warning>
              <FormattedMessage {...messages.mapLocationWarning} />
            </Warning>
          )}
        </Header>

        {!editedMapLayerId ? (
          <>
            <StyledMapLayersList
              onEditLayer={openLayerConfig}
              setView={setView}
              mapConfig={mapConfig}
            />
            <StyledMapCenterAndZoomConfig
              mapView={mapView}
              mapConfig={mapConfig}
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
