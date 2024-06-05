import React, { memo } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import { IMapConfig } from 'api/map_config/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import { ViewOptions } from '..';
import messages from '../messages';
import { getLayerType } from '../utils';

interface Props {
  setView: (view: ViewOptions) => void;
  mapConfig: IMapConfig;
}

const EsriImportOptions = memo<Props>(({ setView, mapConfig }) => {
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

  return (
    <Box mb="12px">
      <Box display="flex" gap="12px" flexWrap="wrap">
        <Tippy
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
              disabled={
                layerType === 'CustomMaps::GeojsonLayer' ||
                !isEsriIntegrationEnabled
              }
            >
              {formatMessage(messages.importEsriFeatureLayer)}
            </Button>
          </div>
        </Tippy>
        <Tippy
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
        </Tippy>
      </Box>
    </Box>
  );
});

export default EsriImportOptions;
