import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import ReportBuilderPage from 'containers/Admin/reporting/containers/ReportBuilderPage';

const Reports = () => {
  return (
    <Box mt="48px">
      <ReportBuilderPage
        tabsToHide={['your-reports', 'service-reports', 'all-reports']}
      />
    </Box>
  );
};

export default Reports;
