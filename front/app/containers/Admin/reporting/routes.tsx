import React, { lazy } from 'react';

import moduleConfiguration from 'modules';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));

export const REPORT_BUILDER = 'report-builder';
export const EDITOR = 'editor';

export enum reportingEnumRoutes {
  reporting = 'reporting',
  reportBuilder = `report-builder`,
  editor = `editor`,
  print = `print`,
}

export type reportingRouteTypes =
  | AdminRoute<reportingEnumRoutes.reporting>
  | AdminRoute<`${reportingEnumRoutes.reporting}/${reportingEnumRoutes.reportBuilder}`>
  | AdminRoute<`${reportingEnumRoutes.reporting}/${reportingEnumRoutes.reportBuilder}?${string}`>
  | AdminRoute<`${reportingEnumRoutes.reporting}/${reportingEnumRoutes.reportBuilder}/${string}/${reportingEnumRoutes.editor}`>;

const reportingRoutes = () => {
  return {
    path: reportingEnumRoutes.reporting,
    element: (
      <PageLoading>
        <ReportingWrapper />
      </PageLoading>
    ),
    children: [
      {
        path: reportingEnumRoutes.reportBuilder,
        element: (
          <PageLoading>
            <ReportBuilderPage />
          </PageLoading>
        ),
      },
      {
        path: `${reportingEnumRoutes.reportBuilder}/:reportId/${reportingEnumRoutes.editor}`,
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
