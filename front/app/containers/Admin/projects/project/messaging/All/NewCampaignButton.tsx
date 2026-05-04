import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

const NewCampaignButton = () => {
  const { projectId } = useParams({ strict: false });
  if (!projectId) return null;
  return (
    <ButtonWithLink
      buttonStyle="admin-dark"
      icon="plus-circle"
      to="/admin/projects/$projectId/messaging/new"
      params={{ projectId }}
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </ButtonWithLink>
  );
};

export default NewCampaignButton;
