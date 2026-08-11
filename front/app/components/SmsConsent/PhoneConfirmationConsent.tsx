import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const PhoneConfirmationConsent = () => (
  <Text
    fontSize="s"
    color="tenantText"
    data-testid="sms-confirmation-disclosure"
  >
    <FormattedMessage
      {...messages.smsConfirmationDisclosure}
      values={{
        termsLink: (
          <Link
            target="_blank"
            to="/pages/$slug"
            params={{ slug: 'terms-and-conditions' }}
          >
            <FormattedMessage {...messages.termsLinkText} />
          </Link>
        ),
        privacyLink: (
          <Link
            target="_blank"
            to="/pages/$slug"
            params={{ slug: 'privacy-policy' }}
          >
            <FormattedMessage {...messages.privacyLinkText} />
          </Link>
        ),
      }}
    />
  </Text>
);

export default PhoneConfirmationConsent;
