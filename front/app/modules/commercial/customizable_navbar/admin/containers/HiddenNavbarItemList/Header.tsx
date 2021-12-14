import React from 'react';

// components
import { SubSectionTitle } from 'components/admin/Section';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export default () => (
  <SubSectionTitle>
    <FormattedMessage {...messages.hiddenFromNavigation} />
    <Button buttonStyle="cl-blue" linkTo="admin/settings/navigation/new-page" />
  </SubSectionTitle>
);
