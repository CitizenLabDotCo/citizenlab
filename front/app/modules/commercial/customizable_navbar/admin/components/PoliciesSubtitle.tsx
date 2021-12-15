import React from 'react';

// components
import { StyledLink } from 'containers/Admin/settings/policies';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { NAVIGATION_PATH } from '../containers';

export default () => (
  <FormattedMessage
    {...messages.policiesSubtitlePremium}
    values={{
      navigationLink: (
        <StyledLink to={NAVIGATION_PATH}>
          <FormattedMessage {...messages.linkToNavigation} />
        </StyledLink>
      ),
    }}
  />
);
