import React, { memo, useState } from 'react';

// components
import MapLayers from './MapLayers';
import MapLayerConfig from './MapLayerConfig';
import MapZoomConfig from './MapZoomConfig';
import MapCenterConfig from './MapCenterConfig';
import {
  SubSectionTitle,
  SectionTitle,
  SectionDescription,
} from 'components/admin/Section';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';

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

const StyledMapLayers = styled(MapLayers)`
  margin-bottom: 70px;
`;

const StyledMapCenterConfig = styled(MapCenterConfig)`
  margin-top: 10px;
  margin-bottom: 30px;
`;

const StyledMapZoomConfig = styled(MapZoomConfig)``;

interface Props {
  projectId: string;
  className?: string;
}

const MapConfigOverview = memo<Props>(({ projectId, className }) => {
  const [editedMapLayerId, setEditedMapLayerId] = useState<string | null>(null);

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
        <SectionDescription>
          <FormattedMessage {...messages.mapConfigurationDescription} />
        </SectionDescription>
      </Header>

      {!editedMapLayerId ? (
        <>
          <StyledMapLayers
            projectId={projectId}
            onEditLayer={openLayerConfig}
          />
          <SubSectionTitle>
            <FormattedMessage {...messages.mapCenterAndZoom} />
          </SubSectionTitle>
          <StyledMapCenterConfig projectId={projectId} />
          <StyledMapZoomConfig projectId={projectId} />
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
});

export default MapConfigOverview;
