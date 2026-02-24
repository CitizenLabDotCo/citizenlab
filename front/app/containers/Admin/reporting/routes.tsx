import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute } from '../routes';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));

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
  path: 'reporting/report-builder',
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
  path: '$reportId/editor',
  component: () => (
    <PageLoading>
      <ReportBuilder />
    </PageLoading>
  ),
});

// Redirect /admin/reporting to /admin/reporting/report-builder
const reportingRedirectRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'reporting',
  component: () => <Navigate to="report-builder" />,
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
