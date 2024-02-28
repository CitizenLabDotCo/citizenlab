import React, { memo } from 'react';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// types
import { ViewOptions } from '.';
import { IMapConfig } from 'api/map_config/types';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { getLayerType } from './utils';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  projectId: string;
  setView: (view: ViewOptions) => void;
  mapConfig: IMapConfig;
}

const EsriImportOptions = memo<Props>(({ setView, mapConfig }) => {
  const { formatMessage } = useIntl();
  const isEsriIntegrationEnabled = useFeatureFlag({ name: 'esri_integration' });

  const layerType = getLayerType(mapConfig);
  const hasExistingWebMap = !isNilOrError(
    mapConfig?.data?.attributes?.esri_web_map_id
  );

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
              icon="location-simple"
              buttonStyle="secondary"
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
          content={getWebMapDisabledMessage()}
          hideOnClick={true}
          disabled={!webMapUploadDisabled}
        >
          <div>
            <Button
              icon="map"
              buttonStyle="secondary"
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
