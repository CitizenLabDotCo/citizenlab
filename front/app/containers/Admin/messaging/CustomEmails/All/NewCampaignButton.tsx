import React from 'react';

import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const NewCampaignButton = () => {
  return (
    <Button
      buttonStyle="admin-dark"
      icon="plus-circle"
      linkTo="/admin/messaging/emails/custom/new"
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </Button>
  );
};

export default NewCampaignButton;
