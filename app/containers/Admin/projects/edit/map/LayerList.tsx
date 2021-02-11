import React, { memo, useState } from 'react';

// components
import Button from 'components/UI/Button';
import ImportButton from './ImportButton';
import LayerConfig, { getLayerColor, getLayerType } from './LayerConfig';
import Tippy from '@tippyjs/react';
import { SectionTitle, SectionDescription } from 'components/admin/Section';
import { SortableList, SortableRow } from 'components/admin/ResourceList';

// hooks
import useMapConfig from 'hooks/useMapConfig';

// services
import {
  createProjectMapLayer,
  deleteProjectMapLayer,
  reorderProjectMapLayer,
} from 'services/mapLayers';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { IMapLayerAttributes } from 'services/mapLayers';

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

const ListItemHeader = styled.div`
  display: flex;
  padding-top: 15px;
  padding-bottom: 15px;
`;

const LayerIcon = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 10px;

  & svg {
    height: 100%;
    fill: ${(props) => props.color};
  }
`;

const LayerName = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 400;
  flex: 1;
`;

const Buttons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const EditButton = styled(Button)``;

const RemoveButton = styled(Button)``;

const Spacer = styled.div`
  width: 14px;
`;

const StyledLayerConfig = styled(LayerConfig)`
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: solid 1px #ccc;
  border-top: solid 1px #ccc;
`;

interface Props {
  projectId: string;
  className?: string;
}

const LayerList = memo<Props>(({ projectId, className }) => {
  const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });
  const mapConfigId = mapConfig?.id || null;

  const [
    editedMapLayer,
    setEditedMapLayer,
  ] = useState<IMapLayerAttributes | null>(null);

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

  const handleReorderLayers = (mapLayerId: string, newOrder: number) => {
    reorderProjectMapLayer(projectId, mapLayerId, newOrder);
  };

  const removeLayer = (layerId: string) => (event: React.FormEvent) => {
    event?.preventDefault();
    deleteProjectMapLayer(projectId, layerId);
  };

  const toggleLayerConfig = (layerId: string) => (event: React.FormEvent) => {
    event?.preventDefault();
    const mapLayer =
      mapConfig?.attributes?.layers?.find((layer) => layer.id === layerId) ||
      null;
    setEditedMapLayer((prevValue) => (prevValue ? null : mapLayer));
  };

  const closeLayerConfig = () => {
    setEditedMapLayer(null);
  };

  const getLayerIcon = (layerType: GeoJSON.GeoJsonTypes) => {
    const pointIcon = (
      <svg viewBox="0 0 18 24">
        <path d="M8 23.5C1.4 13.6 0 12.6 0 9a9 9 0 1118 0c0 3.6-1.3 4.6-8 14.5-.5.7-1.5.7-2 0zm1-10.8a3.7 3.7 0 100-7.4 3.7 3.7 0 000 7.4z" />
      </svg>
    );

    const polygonIcon = (
      <svg viewBox="0 0 21 21">
        <path d="M6.1 21L0 10.1 9.4 0 21 6.4l-1.3 12.3L6 21z" />
      </svg>
    );

    const lineIcon = (
      <svg viewBox="0 0 20 19.7">
        <path
          d="M20 2.8a2.8 2.8 0 01-3.8 2.5L5.3 15.9a2.8 2.8 0 01-2.5 3.8A2.8 2.8 0 114 14.4L14.7 4A2.7 2.7 0 0117.2 0C18.8 0 20 1.2 20 2.8z"
          clipRule="evenodd"
          fillRule="evenodd"
        />
      </svg>
    );

    let layerIcon = polygonIcon;

    if (layerType === 'Point') {
      layerIcon = pointIcon;
    } else if (layerType === 'LineString') {
      layerIcon = lineIcon;
    }

    return layerIcon;
  };

  return (
    <Container className={className || ''}>
      <Header>
        <TitleContainer>
          <StyledSectionTitle>
            <FormattedMessage {...messages.layers} />
          </StyledSectionTitle>
        </TitleContainer>
        <SectionDescription>
          <FormattedMessage {...messages.description} />
        </SectionDescription>
      </Header>

      {!editedMapLayer &&
        mapConfig?.attributes?.layers &&
        mapConfig?.attributes?.layers?.length > 0 && (
          <SortableList
            key={mapConfig.attributes.layers.length}
            items={mapConfig.attributes.layers}
            onReorder={handleReorderLayers}
            className="maplayers-list e2e-admin-maplayers-list"
            id="e2e-admin-maplayers-list"
          >
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {(itemsList as IMapLayerAttributes[]).map((mapLayer, index) => {
                  const layerType = getLayerType(mapLayer);
                  const layerColor = getLayerColor(mapLayer, layerType);
                  const layerIcon = getLayerIcon(layerType);

                  return (
                    <SortableRow
                      key={mapLayer.id}
                      id={mapLayer.id}
                      index={index}
                      lastItem={
                        index === mapConfig.attributes.layers.length - 1
                      }
                      moveRow={handleDragRow}
                      dropRow={handleDropRow}
                    >
                      <ListItemHeader>
                        <LayerIcon color={layerColor}>{layerIcon}</LayerIcon>
                        <LayerName>
                          <T value={mapLayer.title_multiloc} />
                        </LayerName>
                        <Buttons>
                          <Tippy
                            placement="bottom"
                            content={<FormattedMessage {...messages.edit} />}
                            hideOnClick={false}
                            arrow={false}
                          >
                            <div>
                              <EditButton
                                icon="edit"
                                iconSize="16px"
                                buttonStyle="text"
                                padding="0px"
                                onClick={toggleLayerConfig(mapLayer.id)}
                              />
                            </div>
                          </Tippy>

                          <Spacer />

                          <Tippy
                            placement="bottom"
                            content={<FormattedMessage {...messages.remove} />}
                            hideOnClick={false}
                            arrow={false}
                          >
                            <div>
                              <RemoveButton
                                icon="delete"
                                iconSize="16px"
                                buttonStyle="text"
                                padding="0px"
                                onClick={removeLayer(mapLayer.id)}
                              />
                            </div>
                          </Tippy>
                        </Buttons>
                      </ListItemHeader>
                    </SortableRow>
                  );
                })}
              </>
            )}
          </SortableList>
        )}

      {!editedMapLayer && <ImportButton onChange={handleGeoJsonImport} />}

      {editedMapLayer && (
        <StyledLayerConfig
          projectId={projectId}
          mapLayer={editedMapLayer}
          onClose={closeLayerConfig}
        />
      )}
    </Container>
  );
});

export default LayerList;
