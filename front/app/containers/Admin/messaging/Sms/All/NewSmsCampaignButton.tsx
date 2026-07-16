import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const NewSmsCampaignButton = () => (
  <ButtonWithLink
    buttonStyle="admin-dark"
    icon="plus-circle"
    to="/admin/messaging/sms/new"
  >
    <FormattedMessage {...messages.addSmsCampaignButton} />
  </ButtonWithLink>
);

export default NewSmsCampaignButton;
