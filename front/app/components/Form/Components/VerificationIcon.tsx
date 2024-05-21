import React from 'react';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const VerificationIcon = ({ show }) => {
  if (show) {
    return (
      <IconTooltip
        content={<FormattedMessage {...messages.blockedVerified} />}
        icon="lock"
        marginLeft="5px"
      />
    );
  }

  return null;
};

export default VerificationIcon;
