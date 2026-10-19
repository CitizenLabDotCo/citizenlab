import React from 'react';

import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';

import { useIntl } from 'utils/cl-intl';

const LevelError = () => {
  const { formatMessage } = useIntl();

  return <Error text={formatMessage(errorMessages.something_went_wrong)} />;
};

export default LevelError;
