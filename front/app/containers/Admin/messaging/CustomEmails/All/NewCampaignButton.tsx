import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const NewCampaignButton = () => {
  return (
    <ButtonWithLink
      buttonStyle="admin-dark"
      icon="plus-circle"
      linkTo="/admin/messaging/emails/custom/new"
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </ButtonWithLink>
  );
};

export default NewCampaignButton;
