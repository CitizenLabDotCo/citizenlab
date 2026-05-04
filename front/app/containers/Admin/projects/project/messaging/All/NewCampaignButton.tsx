import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../messages';

const NewCampaignButton = () => {
  const { projectId } = useParams({ strict: false });
  return (
    <ButtonWithLink
      buttonStyle="admin-dark"
      icon="plus-circle"
      to="/$locale/admin/projects/$projectId/messaging/new"
      params={{ projectId: projectId ?? '' }}
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </ButtonWithLink>
  );
};

export default NewCampaignButton;
