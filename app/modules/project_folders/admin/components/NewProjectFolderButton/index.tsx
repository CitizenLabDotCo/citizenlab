import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import Button from 'components/UI/Button';

const NewProjectFolderButton = () => (
  <Button linkTo={'/admin/projects/folders/new'} buttonStyle="admin-dark">
    <FormattedMessage {...messages.newProjectFolder} />
  </Button>
);

export default NewProjectFolderButton;
