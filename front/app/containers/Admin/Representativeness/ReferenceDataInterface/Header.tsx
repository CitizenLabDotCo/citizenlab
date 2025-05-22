import React from 'react';

import { Title, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const Header = () => (
  <>
    <Title color="primary" variant="h2">
      <FormattedMessage {...messages.pageTitle} />
    </Title>
    <Text color="textSecondary">
      <FormattedMessage
        {...messages.pageDescription}
        values={{
          userRegistrationLink: (
            <Link to="/admin/settings/registration">
              <FormattedMessage {...messages.userRegistrationLink} />
            </Link>
          ),
        }}
      />
    </Text>
  </>
);

export default Header;
