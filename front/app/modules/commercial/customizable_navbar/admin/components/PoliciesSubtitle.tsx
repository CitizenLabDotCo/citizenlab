import React from 'react';

// components
import { StyledLink } from 'containers/Admin/settings/policies';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

export default () => (
  <FormattedMessage
    {...messages.policiesSubtitlePremium}
    values={{
      navigationLink: (
        <StyledLink to="/admin/settings/navigation">
          <FormattedMessage {...messages.linkToNavigation} />
        </StyledLink>
      ),
    }}
  />
);
