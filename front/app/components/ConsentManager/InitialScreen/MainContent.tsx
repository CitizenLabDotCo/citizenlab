import React from 'react';

import { Text, Title, useBreakpoint } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import CookieModalContentContainer from '../CookieModalContentContainer';
import messages from '../messages';

const MainContent = () => {
  const isSmallerThanPhone = useBreakpoint('phone');

  return (
    <CookieModalContentContainer id="e2e-cookie-banner">
      <Title fontSize={isSmallerThanPhone ? 'xl' : undefined}>
        <FormattedMessage {...messages.modalTitle} />
      </Title>
      <Text>
        <FormattedMessage
          {...messages.modalDescription}
          values={{
            policyLink: (
              <Link to="/pages/cookie-policy?from=cookie-modal">
                <FormattedMessage {...messages.policyLink} />
              </Link>
            ),
          }}
        />
      </Text>
    </CookieModalContentContainer>
  );
};

export default MainContent;
