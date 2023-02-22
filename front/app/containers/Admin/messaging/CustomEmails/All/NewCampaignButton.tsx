import React from 'react';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import useAuthUser from 'hooks/useAuthUser';
import { isAdmin } from 'services/permissions/roles';
import { isNilOrError } from 'utils/helperUtils';

const NewCampaignButton = () => {
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const canCreateNewCampaign = isAdmin({ data: authUser });

  return (
    <Button
      buttonStyle="cl-blue"
      icon="plus-circle"
      linkTo="/admin/messaging/emails/custom/new"
      disabled={!canCreateNewCampaign}
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </Button>
  );
};

export default NewCampaignButton;
