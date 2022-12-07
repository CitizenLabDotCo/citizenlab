import React from 'react';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import DashboardTabs from './components/Tabs';

// i18n
import messages from './messages';

export const ReportingPage = () => (
  <>
    <HelmetIntl
      title={messages.helmetTitle}
      description={messages.helmetDescription}
    />
    <DashboardTabs>
      <div id="e2e-insights-container">
        <RouterOutlet />
      </div>
    </DashboardTabs>
  </>
);

export default ReportingPage;
