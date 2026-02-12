import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { createRoute, Navigate } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

const MessagingIndex = lazy(() => import('.'));
const CustomEmailsIndex = lazy(() => import('./CustomEmails/All'));
const CustomEmailsNew = lazy(() => import('./CustomEmails/New'));
const CustomEmailsShow = lazy(() => import('./CustomEmails/Show'));
const AutomatedEmails = lazy(() => import('./AutomatedEmails'));
const EmailsEdit = lazy(() => import('./Edit'));

export enum messagingRoutes {
  messaging = 'messaging',
  emailsCustom = `emails/custom`,
  emailsCustomNew = `emails/custom/new`,
  emailsCustomCampaignId = 'emails/custom/$campaignId',
  emailsCustomCampaignIdEdit = 'emails/custom/$campaignId/edit',
  emailsAutomated = 'emails/automated',
  emailsAutomatedCampaignIdEdit = 'emails/automated/$campaignId/edit',
}

export type messagingRouteTypes =
  | AdminRoute<messagingRoutes.messaging>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustomNew}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}/${string}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsCustom}/${string}/edit`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsAutomated}`>
  | AdminRoute<`${messagingRoutes.messaging}/${messagingRoutes.emailsAutomated}/${string}/edit`>;

// Messaging edit search schema
const messagingEditSearchSchema = yup.object({
  created: yup.string().optional(),
});

export type MessagingEditSearchParams = yup.InferType<
  typeof messagingEditSearchSchema
>;

const messagingRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: messagingRoutes.messaging,
  component: () => (
    <PageLoading>
      <MessagingIndex />
    </PageLoading>
  ),
});

const messagingIndexRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: '/',
  component: () => <Navigate to={messagingRoutes.emailsCustom} />,
});

const customEmailsRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: messagingRoutes.emailsCustom,
  component: () => (
    <PageLoading>
      <CustomEmailsIndex />
    </PageLoading>
  ),
});

const customEmailsNewRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: messagingRoutes.emailsCustomNew,
  component: () => (
    <PageLoading>
      <CustomEmailsNew />
    </PageLoading>
  ),
});

const customEmailsShowRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: messagingRoutes.emailsCustomCampaignId,
  component: () => (
    <PageLoading>
      <CustomEmailsShow />
    </PageLoading>
  ),
});

const customEmailsEditRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: messagingRoutes.emailsCustomCampaignIdEdit,
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
  path: messagingRoutes.emailsAutomated,
  component: () => (
    <PageLoading>
      <AutomatedEmails />
    </PageLoading>
  ),
});

const automatedEmailsEditRoute = createRoute({
  getParentRoute: () => messagingRoute,
  path: messagingRoutes.emailsAutomatedCampaignIdEdit,
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
