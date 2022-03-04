import { IconTooltip } from '@citizenlab/cl2-component-library';
import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export default ({ show }: { show: boolean }) => {
  if (show) {
    return (
      <IconTooltip
        content={<FormattedMessage {...messages.blockedVerified} />}
        icon="lock"
        marginLeft="5px"
      />
    );
  } else return null;
};
