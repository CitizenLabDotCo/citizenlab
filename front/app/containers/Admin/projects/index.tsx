import React from 'react';

import { Outlet as RouterOutlet } from 'utils/router';

import HelmetIntl from 'components/HelmetIntl';

import messages from './messages';

const AdminProjectsAndFolders = () => (
  <>
    <HelmetIntl
      title={messages.helmetTitle}
      description={messages.helmetDescription}
    />
    <div id="e2e-projects-admin-container">
      <RouterOutlet />
    </div>
  </>
);

export default AdminProjectsAndFolders;
