import React from 'react';

import { useParams } from 'react-router-dom';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const NewCampaignButton = () => {
  const { projectId } = useParams();
  return (
    <Button
      buttonStyle="admin-dark"
      icon="plus-circle"
      linkTo={`/admin/projects/${projectId}/messaging/new`}
    >
      <FormattedMessage {...messages.addCampaignButton} />
    </Button>
  );
};

export default NewCampaignButton;
