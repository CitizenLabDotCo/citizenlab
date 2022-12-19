import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));
const FullScreenReport = lazy(() => import('./containers/FullScreenReport'));

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
        path: 'report-builder',
        element: (
          <PageLoading>
            <ReportBuilderPage />
          </PageLoading>
        ),
      },
      {
        path: 'report-builder/:reportId/editor',
        element: (
          <PageLoading>
            <ReportBuilder />
          </PageLoading>
        ),
      },
      {
        path: 'report-builder/:reportId/viewer',
        element: (
          <PageLoading>
            <FullScreenReport />
          </PageLoading>
        ),
      },
      ...moduleConfiguration.routes['admin.reporting'],
    ],
  };
};

export default reportingRoutes;
