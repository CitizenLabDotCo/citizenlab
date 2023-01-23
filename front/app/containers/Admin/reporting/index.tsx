import React from 'react';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import Tabs from './components/Tabs';

// i18n
import messages from './messages';

export const ReportingPage = () => (
  <>
    <HelmetIntl
      title={messages.helmetTitle}
      description={messages.helmetDescription}
    />
    <Tabs>
      <div id="e2e-reporting-container">
        <RouterOutlet />
      </div>
    </Tabs>
  </>
);

export default ReportingPage;
