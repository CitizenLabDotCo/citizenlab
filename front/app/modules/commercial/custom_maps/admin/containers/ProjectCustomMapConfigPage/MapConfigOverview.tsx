import React, { memo, useState } from 'react';
// styling
import styled from 'styled-components';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import MapCenterAndZoomConfig from './MapCenterAndZoomConfig';
import MapLayerConfig from './MapLayerConfig';
// components
import MapLayersList from './MapLayersList';
import messages from './messages';

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
          <StyledMapLayersList
            projectId={projectId}
            onEditLayer={openLayerConfig}
          />
          <StyledMapCenterAndZoomConfig projectId={projectId} />
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
