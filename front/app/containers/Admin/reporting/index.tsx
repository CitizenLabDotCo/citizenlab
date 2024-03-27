import React from 'react';

import { Outlet as RouterOutlet } from 'react-router-dom';

import HelmetIntl from 'components/HelmetIntl';

import messages from './messages';

export const ReportingPage = () => (
  <>
    <HelmetIntl
      title={messages.helmetTitle}
      description={messages.helmetDescription}
    />
    <div id="e2e-reporting-container">
      <RouterOutlet />
    </div>
  </>
);

export default ReportingPage;
