import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));

const reportingRoutes = () => {
  return {
    path: 'reporting',
    element: (
      <PageLoading>
        <ReportingWrapper />
      </PageLoading>
    ),
    children: [
      {
        path: 'report-creator',
        element: <ReportBuilderPage />,
      },
      ...moduleConfiguration.routes['admin.reporting'],
    ],
  };
};

export default reportingRoutes;
