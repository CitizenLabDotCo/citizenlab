import React from 'react';

import { useParams } from 'react-router-dom';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const NewCampaignButton = () => {
  const { projectId } = useParams();
  return (
    <ButtonWithLink
      buttonStyle="admin-dark"
      icon="plus-circle"
      linkTo={`/admin/projects/${projectId}/messaging/new`}
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </ButtonWithLink>
  );
};

export default NewCampaignButton;
