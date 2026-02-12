import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

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

// Report builder search schema
const reportBuilderSearchSchema = yup.object({
  tab: yup
    .string()
    .oneOf([
      'all-reports',
      'your-reports',
      'service-reports',
      'community-monitor',
    ])
    .optional(),
});

export type ReportBuilderSearchParams = yup.InferType<
  typeof reportBuilderSearchSchema
>;

// reporting/report-builder layout route
const reportBuilderLayoutRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: `${reportingEnumRoutes.reporting}/${reportingEnumRoutes.reportBuilder}`,
  component: () => (
    <PageLoading>
      <ReportingWrapper />
    </PageLoading>
  ),
});

const reportBuilderIndexRoute = createRoute({
  getParentRoute: () => reportBuilderLayoutRoute,
  path: '/',
  validateSearch: (
    search: Record<string, unknown>
  ): ReportBuilderSearchParams =>
    reportBuilderSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <ReportBuilderPage />
    </PageLoading>
  ),
});

const reportEditorRoute = createRoute({
  getParentRoute: () => reportBuilderLayoutRoute,
  path: `$reportId/${reportingEnumRoutes.editor}`,
  component: () => (
    <PageLoading>
      <ReportBuilder />
    </PageLoading>
  ),
});

// Redirect /admin/reporting to /admin/reporting/report-builder
const reportingRedirectRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: reportingEnumRoutes.reporting,
  component: () => <Navigate to={reportingEnumRoutes.reportBuilder} />,
});

const createAdminReportingRoutes = () => {
  return [
    reportBuilderLayoutRoute.addChildren([
      reportBuilderIndexRoute,
      reportEditorRoute,
    ]),
    reportingRedirectRoute,
  ];
};

export default createAdminReportingRoutes;
