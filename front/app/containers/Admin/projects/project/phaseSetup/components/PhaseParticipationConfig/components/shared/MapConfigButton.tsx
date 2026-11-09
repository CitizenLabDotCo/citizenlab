import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../../../../../messages';

// The workspace swaps to the map configuration while this flag is set. It
// stays on the same page, so a phase that isn't saved yet keeps its edits.
const MapConfigButton = () => {
  const { formatMessage } = useIntl();

  return (
    <Button
      buttonStyle="bo-secondary"
      width="100%"
      onClick={() => updateSearchParams({ map_config: true })}
    >
      {formatMessage(messages.configureMap)}
    </Button>
  );
};

export default MapConfigButton;
