import React from 'react';

// components
import { Title, Text } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

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
