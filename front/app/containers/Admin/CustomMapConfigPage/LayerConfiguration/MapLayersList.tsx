import React, { memo } from 'react';

import {
  Box,
  Icon,
  IconTooltip,
  colors,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import { IMapConfig } from 'api/map_config/types';
import useUpdateMapConfig from 'api/map_config/useUpdateMapConfig';
import useDeleteMapLayer from 'api/map_layers/useDeleteMapLayer';
import useReorderMapLayer from 'api/map_layers/useReorderMapLayer';

import useFeatureFlag from 'hooks/useFeatureFlag';

import IconButton from 'design-system/IconButton';
import Link from 'design-system/Link';
import Popover, { DialogTrigger } from 'design-system/Popover';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import { SubSectionTitle } from 'components/admin/Section';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { useParams } from 'utils/router';

import { ViewOptions } from '..';
import { getLayerColor, getLayerIcon } from '../../../../utils/mapUtils/map';
import EsriImportOptions from '../DataImportOptions/EsriImportOptions';
import GeoJsonImportButton from '../DataImportOptions/GeoJsonImportButton';
import messages from '../messages';

import addOrderingToLayers, {
  IMapLayerAttributesWithOrdering,
} from './addOrderingToLayers';
import styles from './LayerConfiguration.module.css';
import LayerTitle from './LayerTitle';

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

const Buttons = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const EditButton = styled(ButtonWithLink)``;

const RemoveButton = styled(ButtonWithLink)``;

const Spacer = styled.div`
  width: 14px;
`;

interface Props {
  mapConfig: IMapConfig;
  onEditLayer: (layerId: string) => void;
  className?: string;
  setView: (view: ViewOptions) => void;
  variant?: 'default' | 'panel';
}

const MapLayersList = memo<Props & WrappedComponentProps & InjectedLocalized>(
  ({
    mapConfig,
    onEditLayer,
    className,
    intl: { formatMessage },
    setView,
    localize,
    variant = 'default',
  }) => {
    const isPanel = variant === 'panel';
    const { projectId } = useParams({ strict: false }) as {
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

    const confirmRemoveLayer = (layerId: string) => {
      const message = formatMessage(messages.deleteConfirmation);

      if (window.confirm(message)) {
        deleteProjectMapLayer({ mapConfigId: mapConfig.data.id, id: layerId });
      }
    };

    const removeLayer = (layerId: string) => (event: React.FormEvent) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      event?.preventDefault();
      confirmRemoveLayer(layerId);
    };

    const removeWebMap = () => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (mapConfig?.data.id) {
        updateMapConfig({
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          mapConfigId: mapConfig?.data.id,
          esri_web_map_id: null,
        });
      }
    };

    const toggleLayerConfig = (layerId: string) => (event: React.FormEvent) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      event?.preventDefault();
      onEditLayer(layerId);
    };

    const supportArticleUrl = formatMessage(messages.supportArticleUrl3);

    const supportArticleLink = (
      <a href={supportArticleUrl} target="_blank" rel="noreferrer">
        <FormattedMessage {...messages.supportArticle} />
      </a>
    );

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const layers = mapConfig?.data.attributes?.layers;
    const layersWithOrdering =
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      layers && layers.length > 0 ? addOrderingToLayers(layers) : null;

    const layersTooltip = isEsriIntegrationEnabled && ( // TODO: Remove once Esri integration is released
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
    );

    if (isPanel) {
      return (
        <div className={className}>
          <h3 className={styles.heading}>
            <span className={styles.headingText}>
              <FormattedMessage {...messages.mapData} />
            </span>
            {isEsriIntegrationEnabled && ( // TODO: Remove once Esri integration is released
              <DialogTrigger>
                <IconButton
                  icon="info-16"
                  size={24}
                  aria-label={formatMessage(messages.mapData)}
                />
                <Popover aria-label={formatMessage(messages.mapData)}>
                  <p className={styles.popoverText}>
                    <FormattedMessage
                      {...messages.layersTooltip}
                      values={{
                        supportArticle: (
                          <Link
                            href={supportArticleUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {formatMessage(messages.supportArticle)}
                          </Link>
                        ),
                      }}
                    />
                  </p>
                </Popover>
              </DialogTrigger>
            )}
          </h3>
          {layersWithOrdering && (
            <SortableList
              key={layersWithOrdering.length}
              items={layersWithOrdering}
              onReorder={handleReorderLayers}
              className={`${styles.layersList} maplayers-list e2e-admin-maplayers-list`}
              id="e2e-admin-maplayers-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                <>
                  {(itemsList as IMapLayerAttributesWithOrdering[]).map(
                    (mapLayer, index) => {
                      const isEsriLayer =
                        mapLayer.type === 'CustomMaps::EsriFeatureLayer';
                      const localizedLayerTitle = localize(
                        mapLayer.title_multiloc
                      );
                      const layerTitle =
                        localizedLayerTitle === 'Unnamed layer'
                          ? formatMessage(messages.unnamedLayer)
                          : localizedLayerTitle;

                      return (
                        <SortableRow
                          key={mapLayer.id}
                          id={mapLayer.id}
                          index={index}
                          isLastItem={index === itemsList.length - 1}
                          moveRow={handleDragRow}
                          dropRow={handleDropRow}
                        >
                          <div className={styles.listItem}>
                            {/* Layer icons are the platform's marker icons, which the design system does not have. */}
                            <Icon
                              className={styles.layerIcon}
                              name={
                                isEsriLayer
                                  ? 'timeline'
                                  : getLayerIcon(mapLayer)
                              }
                              fill={
                                isEsriLayer
                                  ? colors.coolGrey600
                                  : getLayerColor(mapLayer)
                              }
                            />
                            <LayerTitle variant={variant}>
                              {layerTitle}
                            </LayerTitle>
                            <div className={styles.buttons}>
                              {mapLayer.type === 'CustomMaps::GeojsonLayer' && (
                                <IconButton
                                  icon="pencil-14"
                                  aria-label={formatMessage(messages.edit)}
                                  onPress={() => onEditLayer(mapLayer.id)}
                                />
                              )}
                              <div className={styles.spacer} />
                              <IconButton
                                data-cy="e2e-admin-layer-remove-btn"
                                icon="trash-2-16"
                                aria-label={formatMessage(messages.remove)}
                                onPress={() => confirmRemoveLayer(mapLayer.id)}
                              />
                            </div>
                          </div>
                        </SortableRow>
                      );
                    }
                  )}
                </>
              )}
            </SortableList>
          )}
          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {mapConfig?.data.attributes.esri_web_map_id && (
            <div className={styles.webMap}>
              <div className={styles.webMapRow}>
                <div className={styles.listItem}>
                  <Icon
                    className={styles.layerIcon}
                    name="map"
                    fill={colors.coolGrey600}
                  />
                  <LayerTitle variant={variant}>
                    {formatMessage(messages.esriWebMap)}:{' '}
                    {mapConfig.data.attributes.esri_web_map_id}
                  </LayerTitle>
                  <div className={styles.buttons}>
                    <div className={styles.spacer} />
                    <IconButton
                      icon="trash-2-16"
                      aria-label={formatMessage(messages.remove)}
                      onPress={removeWebMap}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TODO: Fix this the next time the file is edited. */}
          {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
          {mapConfig?.data?.id && (
            <>
              {isEsriIntegrationEnabled && ( // TODO: Remove hiding of buttons once Esri integration is released + internal training done
                <EsriImportOptions
                  setView={setView}
                  mapConfig={mapConfig}
                  variant={variant}
                />
              )}
              <GeoJsonImportButton mapConfig={mapConfig} variant={variant} />
            </>
          )}
        </div>
      );
    }

    return (
      <Container className={className || ''}>
        <SubSectionTitle>
          <FormattedMessage {...messages.mapData} />
          {layersTooltip}
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
                    const localizedLayerTitle = localize(
                      mapLayer.title_multiloc
                    );
                    const layerTitle =
                      localizedLayerTitle === 'Unnamed layer'
                        ? formatMessage(messages.unnamedLayer)
                        : localizedLayerTitle;

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
                          <LayerTitle variant={variant}>
                            {layerTitle}
                          </LayerTitle>
                          <Buttons>
                            {mapLayer.type === 'CustomMaps::GeojsonLayer' && (
                              <Tooltip
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
                              </Tooltip>
                            )}

                            <Spacer />

                            <Tooltip
                              placement="bottom"
                              content={
                                <FormattedMessage {...messages.remove} />
                              }
                              hideOnClick={false}
                              arrow={false}
                            >
                              <div>
                                <RemoveButton
                                  data-cy="e2e-admin-layer-remove-btn"
                                  icon="delete"
                                  iconSize="16px"
                                  buttonStyle="text"
                                  padding="0px"
                                  onClick={removeLayer(mapLayer.id)}
                                />
                              </div>
                            </Tooltip>
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
        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {mapConfig?.data.attributes.esri_web_map_id && (
          <Box borderBottom={`1px solid ${colors.divider}`} mb="36px">
            <Box mb="24px" ml="32px">
              <ListItem>
                <LayerIcon name="map" color={colors.coolGrey600} />
                <LayerTitle variant={variant}>
                  {formatMessage(messages.esriWebMap)}:{' '}
                  {/* TODO: Fix this the next time the file is edited. */}
                  {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
                  {mapConfig?.data.attributes.esri_web_map_id}
                </LayerTitle>
                <Buttons>
                  <Spacer />
                  <Tooltip
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
                  </Tooltip>
                </Buttons>
              </ListItem>
            </Box>
          </Box>
        )}

        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {mapConfig?.data?.id && (
          <>
            {isEsriIntegrationEnabled && ( // TODO: Remove hiding of buttons once Esri integration is released + internal training done
              <EsriImportOptions
                setView={setView}
                mapConfig={mapConfig}
                variant={variant}
              />
            )}
            <GeoJsonImportButton mapConfig={mapConfig} variant={variant} />
          </>
        )}
      </Container>
    );
  }
);

export default injectIntl(injectLocalize(MapLayersList));
