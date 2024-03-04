import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {}

const EmptyMessageModerationWithFlag = (_props: Props) => {
  return <FormattedMessage {...messages.noWarningItems} />;
};

export default EmptyMessageModerationWithFlag;
