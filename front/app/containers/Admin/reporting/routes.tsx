import React, { lazy } from 'react';
import moduleConfiguration from 'modules';
import PageLoading from 'components/UI/PageLoading';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));

export const REPORTING = 'reporting';
export const REPORT_BUILDER = 'report-builder';
export const EDITOR = 'editor';
export const PRINT = 'print';

const reportingRoutes = () => {
  return {
    path: REPORTING,
    element: (
      <PageLoading>
        <ReportingWrapper />
      </PageLoading>
    ),
    children: [
      {
        path: REPORT_BUILDER,
        element: (
          <PageLoading>
            <ReportBuilderPage />
          </PageLoading>
        ),
      },
      {
        path: `${REPORT_BUILDER}/:reportId/${EDITOR}`,
        element: (
          <PageLoading>
            <ReportBuilder />
          </PageLoading>
        ),
      },
      ...moduleConfiguration.routes['admin.reporting'],
    ],
  };
};

export default reportingRoutes;
