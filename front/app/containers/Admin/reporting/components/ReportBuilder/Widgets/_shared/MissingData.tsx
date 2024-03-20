import React from 'react';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const MissingData = () => {
  const { formatMessage } = useIntl();

  return <Error text={formatMessage(messages.missingData)} />;
};

export default MissingData;
