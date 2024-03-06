import React, { memo, useState } from 'react';

import MapView from '@arcgis/core/views/MapView';
import { Text } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

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
  projectId: string;
  mapView?: MapView | null;
  className?: string;
  setView: (view: ViewOptions) => void;
}

const MapConfigOverview = memo<Props>(
  ({ projectId, className, setView, mapView }) => {
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
          <TitleContainer>
            <StyledSectionTitle>
              <FormattedMessage {...messages.mapConfigurationTitle} />
            </StyledSectionTitle>
          </TitleContainer>
          <Text color="textSecondary">
            <FormattedMessage {...messages.mapConfigurationDescription} />
          </Text>
          <Warning>
            <FormattedMessage {...messages.mapLocationWarning} />
          </Warning>
        </Header>

        {!editedMapLayerId ? (
          <>
            <StyledMapLayersList
              projectId={projectId}
              onEditLayer={openLayerConfig}
              setView={setView}
            />
            <StyledMapCenterAndZoomConfig
              projectId={projectId}
              mapView={mapView}
            />
          </>
        ) : (
          <MapLayerConfig
            projectId={projectId}
            mapLayerId={editedMapLayerId}
            onClose={closeLayerConfig}
          />
        )}
      </Container>
    );
  }
);

export default MapConfigOverview;
