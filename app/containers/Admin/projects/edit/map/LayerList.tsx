import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import ImportButton from './ImportButton';
import LayerConfig from './LayerConfig';

// hooks
import useMapConfig from 'hooks/useMapConfig';

// services
import {
  createProjectMapLayer,
  deleteProjectMapLayer,
} from 'services/mapLayers';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const Title = styled.h2`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  line-height: normal;
  font-weight: 500;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 30px;
`;

const ListItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-top: solid 1px #ccc;
  border-bottom: solid 1px #ccc;
`;

const ListItemHeader = styled.div`
  display: flex;
  padding-top: 12px;
  padding-bottom: 12px;
`;

const LayerName = styled.div`
  flex: 1;
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const EditButton = styled(Button)``;

const RemoveButton = styled(Button)`
  margin-left: 15px;
`;

const StyledLayerConfig = styled(LayerConfig)`
  margin-top: 35px;
  margin-bottom: 20px;
`;

interface Props {
  projectId: string;
  className?: string;
}

const LayerList = memo<Props>(({ projectId, className }) => {
  const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });

  const [editedLayerId, setEditedLayerId] = useState<string | null>(null);

  const mapConfigId = !isNilOrError(mapConfig) ? mapConfig.id : null;

  const handleGeoJsonImport = (geojson: GeoJSON.FeatureCollection) => {
    if (mapConfigId) {
      createProjectMapLayer(projectId, {
        geojson,
        id: mapConfigId,
        title_multiloc: {
          en: `Unnamed layer ${Date.now()}`,
        },
        default_enabled: true,
      });
    }
  };

  const removeLayer = (layerId: string) => (event: React.FormEvent) => {
    event?.preventDefault();
    deleteProjectMapLayer(projectId, layerId);
  };

  const toggleLayerConfig = (layerId: string) => (event: React.FormEvent) => {
    event?.preventDefault();
    setEditedLayerId((prevValue) => (prevValue === layerId ? null : layerId));
  };

  const closeLayerConfig = () => {
    setEditedLayerId(null);
  };

  return (
    <Container className={className || ''}>
      <Title>
        <FormattedMessage {...messages.layers} />
      </Title>
      {!isNilOrError(mapConfig) && mapConfig?.attributes?.layers?.length > 0 && (
        <List>
          {mapConfig?.attributes?.layers?.map((mapLayer, index) => (
            <ListItem key={index} className={index === 0 ? 'first' : ''}>
              <ListItemHeader>
                <LayerName>
                  <T value={mapLayer.title_multiloc} />
                </LayerName>
                <Buttons>
                  {editedLayerId !== mapLayer.id ? (
                    <>
                      <EditButton
                        icon="edit"
                        buttonStyle="text"
                        padding="0px"
                        onClick={toggleLayerConfig(mapLayer.id)}
                      />
                      <RemoveButton
                        icon="delete"
                        buttonStyle="text"
                        padding="0px"
                        onClick={removeLayer(mapLayer.id)}
                      />
                    </>
                  ) : (
                    <Button
                      buttonStyle="text"
                      padding="0px"
                      onClick={toggleLayerConfig(mapLayer.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </Buttons>
              </ListItemHeader>
              {editedLayerId === mapLayer.id && (
                <StyledLayerConfig
                  projectId={projectId}
                  mapLayerId={mapLayer.id}
                  onClose={closeLayerConfig}
                />
              )}
            </ListItem>
          ))}
        </List>
      )}
      <ImportButton onChange={handleGeoJsonImport} />
    </Container>
  );
});

export default LayerList;
