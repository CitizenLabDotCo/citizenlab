import React, { memo } from 'react';

import {
  Box,
  Icon,
  IconTooltip,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { WrappedComponentProps } from 'react-intl';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IMapConfig } from 'api/map_config/types';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';
import useDeleteMapLayer from 'api/map_layers/useDeleteMapLayer';
import useReorderMapLayer from 'api/map_layers/useReorderMapLayer';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SortableList, SortableRow } from 'components/admin/ResourceList';
import { SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

import { ViewOptions } from '..';
import { getLayerColor, getLayerIcon } from '../../../../utils/mapUtils/map';
import EsriImportOptions from '../DataImportOptions/EsriImportOptions';
import GeoJsonImportButton from '../DataImportOptions/GeoJsonImportButton';
import messages from '../messages';

import addOrderingToLayers, {
  IMapLayerAttributesWithOrdering,
} from './addOrderingToLayers';

const Container = styled.div``;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 5px;
`;

const StyledSortableList = styled(SortableList)`
  margin-top: 5px;
  margin-bottom: 25px;
`;

const ListItem = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const LayerIcon = styled(Icon)<{ color: string }>`
  fill: ${(props) => props.color};
  margin-right: 10px;
`;

const LayerName = styled.div`
  color: ${colors.primary};
  font-size: ${fontSizes.m}px;
  line-height: normal;
  font-weight: 400;
  flex: 1;
  display: flex;
  align-items: center;
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

interface Props {
  mapConfig: IMapConfig;
  onEditLayer: (layerId: string) => void;
  className?: string;
  setView: (view: ViewOptions) => void;
}

const MapLayersList = memo<Props & WrappedComponentProps & InjectedLocalized>(
  ({
    mapConfig,
    onEditLayer,
    className,
    intl: { formatMessage },
    setView,
    localize,
  }) => {
    const { projectId } = useParams() as {
      projectId: string;
    };

    const { mutate: deleteProjectMapLayer } = useDeleteMapLayer(projectId);
    const { mutate: reorderProjectMapLayer } = useReorderMapLayer(projectId);
    const { mutateAsync: updateMapConfig } = useUpdateMapConfig(projectId);
    const isEsriIntegrationEnabled = useFeatureFlag({
      name: 'esri_integration',
    });

    const handleReorderLayers = (mapLayerId: string, newOrder: number) => {
      reorderProjectMapLayer({
        mapConfigId: mapConfig.data.id,
        id: mapLayerId,
        ordering: newOrder,
      });
    };

    const removeLayer = (layerId: string) => (event: React.FormEvent) => {
      event?.preventDefault();

      const message = formatMessage(messages.deleteConfirmation);

      if (window.confirm(message)) {
        deleteProjectMapLayer({ mapConfigId: mapConfig.data.id, id: layerId });
      }
    };

    const removeWebMap = () => {
      if (mapConfig?.data.id) {
        updateMapConfig({
          mapConfigId: mapConfig?.data.id,
          esri_web_map_id: null,
        });
      }
    };

    const toggleLayerConfig = (layerId: string) => (event: React.FormEvent) => {
      event?.preventDefault();
      onEditLayer(layerId);
    };

    const supportArticleUrl = formatMessage(messages.supportArticleUrl);

    const supportArticleLink = (
      <a href={supportArticleUrl} target="_blank" rel="noreferrer">
        <FormattedMessage {...messages.supportArticle} />
      </a>
    );

    const layers = mapConfig?.data.attributes?.layers;
    const layersWithOrdering =
      layers && layers.length > 0 ? addOrderingToLayers(layers) : null;

    return (
      <Container className={className || ''}>
        <SubSectionTitle>
          <FormattedMessage {...messages.mapData} />
          <StyledIconTooltip
            content={
              <FormattedMessage
                {...messages.layersTooltip}
                values={{
                  supportArticle: supportArticleLink,
                }}
              />
            }
          />
        </SubSectionTitle>
        {layersWithOrdering && (
          <StyledSortableList
            key={layersWithOrdering.length}
            items={layersWithOrdering}
            onReorder={handleReorderLayers}
            className="maplayers-list e2e-admin-maplayers-list"
            id="e2e-admin-maplayers-list"
          >
            {({ itemsList, handleDragRow, handleDropRow }) => (
              <>
                {(itemsList as IMapLayerAttributesWithOrdering[]).map(
                  (mapLayer, index) => {
                    const layerColor = getLayerColor(mapLayer);
                    const layerIconName = getLayerIcon(mapLayer);
                    const layerTitle = localize(mapLayer.title_multiloc);

                    return (
                      <SortableRow
                        key={mapLayer.id}
                        id={mapLayer.id}
                        index={index}
                        isLastItem={index === itemsList.length - 1}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                      >
                        <ListItem>
                          <LayerIcon
                            name={
                              mapLayer.type === 'CustomMaps::EsriFeatureLayer'
                                ? 'timeline'
                                : layerIconName
                            }
                            color={
                              mapLayer.type === 'CustomMaps::EsriFeatureLayer'
                                ? colors.coolGrey600
                                : layerColor
                            }
                          />
                          <LayerName>{layerTitle}</LayerName>
                          <Buttons>
                            {mapLayer.type === 'CustomMaps::GeojsonLayer' && (
                              <Tippy
                                placement="bottom"
                                content={
                                  <FormattedMessage {...messages.edit} />
                                }
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
                            )}

                            <Spacer />

                            <Tippy
                              placement="bottom"
                              content={
                                <FormattedMessage {...messages.remove} />
                              }
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
                        </ListItem>
                      </SortableRow>
                    );
                  }
                )}
              </>
            )}
          </StyledSortableList>
        )}
        {mapConfig?.data.attributes.esri_web_map_id && (
          <Box borderBottom={`1px solid ${colors.divider}`} mb="36px">
            <Box mb="24px" ml="32px">
              <ListItem>
                <LayerIcon name="map" color={colors.coolGrey600} />
                <LayerName>
                  {formatMessage(messages.esriWebMap)}:{' '}
                  {mapConfig?.data.attributes.esri_web_map_id}
                </LayerName>
                <Buttons>
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
                        onClick={removeWebMap}
                      />
                    </div>
                  </Tippy>
                </Buttons>
              </ListItem>
            </Box>
          </Box>
        )}

        {mapConfig?.data?.id && (
          <>
            {isEsriIntegrationEnabled && ( // TODO: Remove hiding of buttons once Esri integration is released + internal training done
              <EsriImportOptions setView={setView} mapConfig={mapConfig} />
            )}
            <GeoJsonImportButton mapConfig={mapConfig} />
          </>
        )}
      </Container>
    );
  }
);

export default injectIntl(injectLocalize(MapLayersList));
