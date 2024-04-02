import React, { lazy } from 'react';

import { Navigate } from 'react-router-dom';

import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));

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
  return [
    {
      path: `${reportingEnumRoutes.reporting}/${reportingEnumRoutes.reportBuilder}`,
      element: (
        <PageLoading>
          <ReportingWrapper />
        </PageLoading>
      ),
      children: [
        {
          index: true,
          element: (
            <PageLoading>
              <ReportBuilderPage />
            </PageLoading>
          ),
        },
        {
          path: `:reportId/${reportingEnumRoutes.editor}`,
          element: (
            <PageLoading>
              <ReportBuilder />
            </PageLoading>
          ),
        },
      ],
    },
    {
      path: reportingEnumRoutes.reporting,
      element: <Navigate to={reportingEnumRoutes.reportBuilder} />,
    },
  ];
};

export default reportingRoutes;
