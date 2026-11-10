import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  onClick: () => void;
};

// Small "← Previous" link-style button at the top of a form page.
const PreviousPageButton = ({ onClick }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box display="flex" mb="16px" ml="-12px">
      <Button
        type="button"
        buttonStyle="text"
        icon="arrow-left"
        padding="6px 12px"
        onClick={onClick}
        data-cy="e2e-previous-page"
      >
        {formatMessage(messages.previous)}
      </Button>
    </Box>
  );
};

export default PreviousPageButton;
