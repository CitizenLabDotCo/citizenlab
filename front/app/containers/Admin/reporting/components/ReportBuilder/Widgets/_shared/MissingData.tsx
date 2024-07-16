import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const MissingData = () => {
  const { formatMessage } = useIntl();

  return (
    <Box className="e2e-widget-missing-data">
      <Error text={formatMessage(messages.missingData)} />
    </Box>
  );
};

export default MissingData;
