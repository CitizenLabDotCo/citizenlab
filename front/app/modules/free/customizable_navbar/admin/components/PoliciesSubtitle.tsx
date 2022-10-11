import React from 'react';

// components
import { StyledLink } from 'containers/Admin/settings/policies';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

export default () => {
  return (
    <FormattedMessage
      {...messages.policiesSubtitlePremium}
      values={{
        navigationLink: (
          <StyledLink to={PAGES_MENU_PATH}>
            <FormattedMessage {...messages.linkToNavigation} />
          </StyledLink>
        ),
      }}
    />
  );
};
