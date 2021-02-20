import React, { memo, useState } from 'react';
import * as gjv from 'geojson-validation';

// components
import Button from 'components/UI/Button';
import { Icon, IconTooltip } from 'cl2-component-library';
import ImportButton from './ImportButton';
import Tippy from '@tippyjs/react';
import { SubSectionTitle } from 'components/admin/Section';
import { SortableList, SortableRow } from 'components/admin/ResourceList';
import Error from 'components/UI/Error';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useMapConfig from 'hooks/useMapConfig';

// services
import {
  createProjectMapLayer,
  deleteProjectMapLayer,
  reorderProjectMapLayer,
} from 'services/mapLayers';

// utils
import { getLayerColor, getLayerIcon } from 'utils/map';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import T from 'components/T';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { IMapLayerAttributes } from 'services/mapLayers';

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
  width: 22px;
  height: 22px;
  margin-right: 10px;
`;

const LayerName = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.medium}px;
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
  projectId: string;
  onEditLayer: (layerId: string) => void;
  className?: string;
}

const MapLayers = memo<Props & InjectedIntlProps>(
  ({ projectId, onEditLayer, className, intl: { formatMessage } }) => {
    const tenantLocales = useAppConfigurationLocales();
    const mapConfig = useMapConfig({ projectId, prefetchMapLayers: true });
    const mapConfigId = mapConfig?.id || null;

    const [importError, setImportError] = useState(false);

    const handleGeoJsonImport = (geojson: GeoJSON.FeatureCollection) => {
      setImportError(false);

      if (gjv.valid(geojson)) {
        if (mapConfigId) {
          const unnamedLayersCount =
            mapConfig?.attributes?.layers?.filter((layer) =>
              layer?.title_multiloc?.['en']?.startsWith('Unnamed')
            )?.length || 0;

          const newUnnamedLayerTitle = `Unnamed layer ${
            unnamedLayersCount + 1
          }`;

          const title_multiloc = {
            en: newUnnamedLayerTitle,
          };

          if (!isNilOrError(tenantLocales)) {
            tenantLocales.forEach(
              (tenantLocale) =>
                (title_multiloc[tenantLocale] = newUnnamedLayerTitle)
            );
          }

          createProjectMapLayer(projectId, {
            geojson,
            title_multiloc,
            id: mapConfigId,
            default_enabled: true,
          });
        }
      } else {
        setImportError(true);
      }
    };

    const handleReorderLayers = (mapLayerId: string, newOrder: number) => {
      reorderProjectMapLayer(projectId, mapLayerId, newOrder);
    };

    const removeLayer = (layerId: string) => (event: React.FormEvent) => {
      event?.preventDefault();

      const message = formatMessage(messages.deleteConfirmation);

      if (window.confirm(message)) {
        deleteProjectMapLayer(projectId, layerId);
      }
    };

    const toggleLayerConfig = (layerId: string) => (event: React.FormEvent) => {
      event?.preventDefault();
      onEditLayer(layerId);
    };

    return (
      <Container className={className || ''}>
        <SubSectionTitle>
          <FormattedMessage {...messages.layers} />
          <StyledIconTooltip
            content={<FormattedMessage {...messages.layersTitleTooltip} />}
          />
        </SubSectionTitle>
        {mapConfig?.attributes?.layers &&
          mapConfig?.attributes?.layers?.length > 0 && (
            <StyledSortableList
              key={mapConfig.attributes.layers.length}
              items={mapConfig.attributes.layers}
              onReorder={handleReorderLayers}
              className="maplayers-list e2e-admin-maplayers-list"
              id="e2e-admin-maplayers-list"
            >
              {({ itemsList, handleDragRow, handleDropRow }) => (
                <>
                  {(itemsList as IMapLayerAttributes[]).map(
                    (mapLayer, index) => {
                      const layerColor = getLayerColor(mapLayer);
                      const layerIconName = getLayerIcon(mapLayer);

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
                          <ListItem>
                            <LayerIcon
                              name={layerIconName}
                              color={layerColor}
                            />
                            <LayerName>
                              <T value={mapLayer.title_multiloc} />
                            </LayerName>
                            <Buttons>
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

        <ImportButton onChange={handleGeoJsonImport} />

        {importError && (
          <Error
            text={<FormattedMessage {...messages.importError} />}
            marginTop="10px"
            showBackground={false}
            showIcon={true}
          />
        )}
      </Container>
    );
  }
);

export default injectIntl(MapLayers);
