import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import Navigate from 'utils/cl-router/Navigate';
import { createRoute } from 'utils/router';

import { quarters } from '../communityMonitor/components/LiveMonitor/components/HealthScoreWidget/types';
import { adminRoute } from '../routes';

const ReportingWrapper = lazy(() => import('.'));
const ReportBuilderPage = lazy(() => import('./containers/ReportBuilderPage'));
const ReportBuilder = lazy(() => import('./containers/ReportBuilder'));

export const reportBuilderTabs = [
  'all-reports',
  'your-reports',
  'service-reports',
  'community-monitor',
] as const;

// Report builder search schema
const reportBuilderSearchSchema = yup.object({
  tab: yup.string().oneOf(reportBuilderTabs).optional(),
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

const reportEditorSearchSchema = yup.object({
  preview: yup.string().oneOf(['true', 'false']).optional(),
  templateProjectId: yup.string().optional(),
  templatePhaseId: yup.string().optional(),
  startDatePlatformReport: yup.string().optional(),
  endDatePlatformReport: yup.string().optional(),
  year: yup.string().optional(),
  quarter: yup.string().oneOf(quarters).optional(),
});

const reportEditorRoute = createRoute({
  getParentRoute: () => reportBuilderLayoutRoute,
  path: '$reportId/editor',
  validateSearch: (search: Record<string, unknown>) =>
    reportEditorSearchSchema.validateSync(search, { stripUnknown: true }),
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
  component: () => <Navigate to="/admin/reporting/report-builder" />,
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
