import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';
import { Navigate } from 'react-router-dom';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));

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
        path: '',
        element: <Navigate to="report-creator" />,
      },
      {
        path: 'report-creator',
        element: <ReportBuilder />,
      },
      ...moduleConfiguration.routes['admin.reporting'],
    ],
  };
};

export default reportingRoutes;
