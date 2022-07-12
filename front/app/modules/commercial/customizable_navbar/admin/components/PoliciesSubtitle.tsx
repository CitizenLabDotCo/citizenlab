import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { StyledLink } from 'containers/Admin/settings/policies';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { PAGES_MENU_PATH } from 'containers/Admin/pages-menu/routes';

export default () => {
  const featureEnabled = useFeatureFlag({ name: 'customizable_navbar' });

  if (!featureEnabled) return null;

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
