import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { StyledLink } from 'containers/Admin/settings/policies';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { ADMIN_PAGES_MENU_PATH } from 'containers/Admin/pagesAndMenu/routes';

export default () => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });

  if (!featureEnabled) return null;

  return (
    <FormattedMessage
      {...messages.policiesSubtitlePremium}
      values={{
        navigationLink: (
          <StyledLink to={ADMIN_PAGES_MENU_PATH}>
            <FormattedMessage {...messages.linkToNavigation} />
          </StyledLink>
        ),
      }}
    />
  );
};
