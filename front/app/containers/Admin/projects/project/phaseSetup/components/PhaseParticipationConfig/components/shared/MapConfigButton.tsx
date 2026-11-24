import React from 'react';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from '../../../../../messages';

import 'design-system/tokens.css';

// The workspace swaps to the map configuration while this flag is set. It
// stays on the same page, so a phase that isn't saved yet keeps its edits.
const MapConfigButton = () => {
  const { formatMessage } = useIntl();

  return (
    <Button
      fullWidth
      variant="secondary"
      size={32}
      onPress={() => updateSearchParams({ map_config: true })}
    >
      {formatMessage(messages.configureMap)}
    </Button>
  );
};

export default MapConfigButton;
