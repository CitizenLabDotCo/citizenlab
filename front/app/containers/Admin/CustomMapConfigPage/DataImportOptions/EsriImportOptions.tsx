import React, { memo } from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';

import { IMapConfig } from 'api/map_config/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import DSButton from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';

import { ViewOptions } from '..';
import messages from '../messages';
import { getLayerType } from '../utils';

import styles from './DataImportOptions.module.css';

interface Props {
  setView: (view: ViewOptions) => void;
  mapConfig: IMapConfig;
  variant?: 'default' | 'panel';
}

const EsriImportOptions = memo<Props>(({ setView, mapConfig, variant }) => {
  const { formatMessage } = useIntl();
  const isEsriIntegrationEnabled = useFeatureFlag({ name: 'esri_integration' });

  const layerType = getLayerType(mapConfig);
  const hasExistingWebMap = !!mapConfig.data.attributes.esri_web_map_id;

  const webMapUploadDisabled =
    hasExistingWebMap ||
    layerType === 'CustomMaps::GeojsonLayer' ||
    !isEsriIntegrationEnabled;

  const getWebMapDisabledMessage = () => {
    if (!isEsriIntegrationEnabled) {
      return formatMessage(messages.esriAddOnFeatureTooltip);
    } else if (layerType === 'CustomMaps::GeojsonLayer') {
      return formatMessage(messages.webMapRemoveGeojsonTooltip);
    } else if (hasExistingWebMap) {
      return formatMessage(messages.webMapAlreadyExists);
    }
    return;
  };

  const featureLayerUploadDisabled =
    layerType === 'CustomMaps::GeojsonLayer' || !isEsriIntegrationEnabled;

  if (variant === 'panel') {
    return (
      <div className={styles.esriOptions}>
        <DSButton
          data-cy="e2e-feature-layer-upload-btn"
          icon="map-pin-14"
          onPress={() => {
            setView('featureLayerUpload');
          }}
          isDisabled={featureLayerUploadDisabled}
          disabledReason={
            layerType === 'CustomMaps::GeojsonLayer' && isEsriIntegrationEnabled
              ? formatMessage(messages.featureLayerRemoveGeojsonTooltip)
              : undefined
          }
        >
          {formatMessage(messages.importEsriFeatureLayer)}
        </DSButton>
        <DSButton
          data-cy="e2e-web-map-upload-btn"
          onPress={() => {
            setView('webMapUpload');
          }}
          isDisabled={webMapUploadDisabled}
          disabledReason={
            webMapUploadDisabled ? getWebMapDisabledMessage() : undefined
          }
        >
          {formatMessage(messages.importEsriWebMap)}
        </DSButton>
      </div>
    );
  }

  return (
    <Box mb="12px">
      <Box display="flex" gap="12px" flexWrap="wrap">
        <Tooltip
          maxWidth="250px"
          placement="top"
          zIndex={9999999}
          content={
            isEsriIntegrationEnabled
              ? formatMessage(messages.featureLayerRemoveGeojsonTooltip)
              : formatMessage(messages.esriAddOnFeatureTooltip)
          }
          hideOnClick={true}
          disabled={
            layerType !== 'CustomMaps::GeojsonLayer' ||
            !isEsriIntegrationEnabled
          }
        >
          <div>
            <Button
              data-cy="e2e-feature-layer-upload-btn"
              icon="location-simple"
              buttonStyle="secondary-outlined"
              onClick={() => {
                setView('featureLayerUpload');
              }}
              disabled={featureLayerUploadDisabled}
            >
              {formatMessage(messages.importEsriFeatureLayer)}
            </Button>
          </div>
        </Tooltip>
        <Tooltip
          maxWidth="250px"
          placement="top"
          zIndex={9999999}
          content={getWebMapDisabledMessage()}
          hideOnClick={true}
          disabled={!webMapUploadDisabled}
        >
          <div>
            <Button
              data-cy="e2e-web-map-upload-btn"
              icon="map"
              buttonStyle="secondary-outlined"
              onClick={() => {
                setView('webMapUpload');
              }}
              disabled={webMapUploadDisabled}
            >
              {formatMessage(messages.importEsriWebMap)}
            </Button>
          </div>
        </Tooltip>
      </Box>
    </Box>
  );
});

export default EsriImportOptions;
