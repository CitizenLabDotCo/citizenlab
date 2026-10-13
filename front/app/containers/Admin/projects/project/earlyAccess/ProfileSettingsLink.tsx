import React from 'react';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

const ProfileSettingsLink = () => (
  <Link to="/profile/edit">
    <FormattedMessage {...messages.profileSettingsLink} />
  </Link>
);

export default ProfileSettingsLink;
