import React from 'react';
import HelmetIntl from 'components/HelmetIntl';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
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
