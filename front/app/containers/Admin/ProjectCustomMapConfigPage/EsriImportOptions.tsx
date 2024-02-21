import React, { memo } from 'react';

// components
import { Box, Button } from '@citizenlab/cl2-component-library';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// types
import { ViewOptions } from '.';

interface Props {
  projectId: string;
  mapConfigId: string;
  setView: (view: ViewOptions) => void;
}

const EsriImportOptions = memo<Props>(({ setView }) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="12px">
      <Box display="flex" gap="12px" flexWrap="wrap">
        <Button
          icon="location-simple"
          buttonStyle="secondary"
          onClick={() => {
            setView('featureLayerUpload');
          }}
        >
          {formatMessage(messages.importEsriFeatureLayer)}
        </Button>
        <Button
          icon="map"
          buttonStyle="secondary"
          onClick={() => {
            setView('webMapUpload');
          }}
        >
          {formatMessage(messages.importEsriWebMap)}
        </Button>
      </Box>
    </Box>
  );
});

export default EsriImportOptions;
