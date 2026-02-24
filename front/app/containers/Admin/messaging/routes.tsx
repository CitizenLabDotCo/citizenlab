import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute } from '../routes';

const MessagingIndex = lazy(() => import('.'));
const CustomEmailsIndex = lazy(() => import('./CustomEmails/All'));
const CustomEmailsNew = lazy(() => import('./CustomEmails/New'));
const CustomEmailsShow = lazy(() => import('./CustomEmails/Show'));
const AutomatedEmails = lazy(() => import('./AutomatedEmails'));
const EmailsEdit = lazy(() => import('./Edit'));

// Messaging edit search schema
const messagingEditSearchSchema = yup.object({
  created: yup.string().optional(),
});

export type MessagingEditSearchParams = yup.InferType<
  typeof messagingEditSearchSchema
>;

const messagingRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'messaging',
  component: () => (
    <PageLoading>
      <MessagingIndex />
    </PageLoading>
  ),
});

const messagingIndexRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: '/',
  component: () => <Navigate to="emails/custom" />,
});

const customEmailsRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: 'emails/custom',
  component: () => (
    <PageLoading>
      <CustomEmailsIndex />
    </PageLoading>
  ),
});

const customEmailsNewRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: 'emails/custom/new',
  component: () => (
    <PageLoading>
      <CustomEmailsNew />
    </PageLoading>
  ),
});

const customEmailsShowRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: 'emails/custom/$campaignId',
  component: () => (
    <PageLoading>
      <CustomEmailsShow />
    </PageLoading>
  ),
});

const customEmailsEditRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: 'emails/custom/$campaignId/edit',
  validateSearch: (
    search: Record<string, unknown>
  ): MessagingEditSearchParams =>
    messagingEditSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <EmailsEdit campaignType="custom" />
    </PageLoading>
  ),
});

const automatedEmailsRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: 'emails/automated',
  component: () => (
    <PageLoading>
      <AutomatedEmails />
    </PageLoading>
  ),
});

const automatedEmailsEditRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: 'emails/automated/$campaignId/edit',
  validateSearch: (
    search: Record<string, unknown>
  ): MessagingEditSearchParams =>
    messagingEditSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <EmailsEdit campaignType="automated" />
    </PageLoading>
  ),
});

const createAdminMessagingRoutes = () => {
  return messagingRoute.addChildren([
    messagingIndexRoute,
    customEmailsRoute,
    customEmailsNewRoute,
    customEmailsShowRoute,
    customEmailsEditRoute,
    automatedEmailsRoute,
    automatedEmailsEditRoute,
  ]);
};

export default createAdminMessagingRoutes;
