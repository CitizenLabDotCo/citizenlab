import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

const ProjectFolderTitle = () => (
  <FormattedMessage {...messages.projectsAndFolders} />
);

export default ProjectFolderTitle;
