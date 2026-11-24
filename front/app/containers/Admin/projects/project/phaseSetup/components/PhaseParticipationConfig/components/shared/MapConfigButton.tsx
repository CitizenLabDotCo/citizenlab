import React from 'react';

import Button from 'design-system/Button';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { hasCustomMapSettings } from 'utils/map';

import messages from '../../../../../messages';

import 'design-system/tokens.css';

// The workspace swaps to the map configuration while this flag is set. It
// stays on the same page, so a phase that isn't saved yet keeps its edits.
const MapConfigButton = ({ projectId }: { projectId?: string }) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const { data: mapConfig } = useProjectMapConfig(projectId);
  const configured = hasCustomMapSettings(mapConfig?.data, appConfig?.data);

  return (
    <Button
      fullWidth
      variant="secondary"
      size={32}
      onPress={() => updateSearchParams({ map_config: true })}
    >
      {formatMessage(configured ? messages.editMap : messages.configureMap)}
    </Button>
  );
};

export default MapConfigButton;
