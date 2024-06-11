import React, { lazy } from 'react';

import moduleConfiguration from 'modules';

import IdeaPreviewIndex from 'components/admin/PostManager/components/IdeaPreviewIndex';
import PageLoading from 'components/UI/PageLoading';

import { AdminRoute } from '../routes';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));

export enum ideaRoutes {
  ideas = 'ideas',
  ideaId = `:ideaId`,
}

export type ideaRouteTypes =
  | AdminRoute<ideaRoutes.ideas>
  | AdminRoute<`${ideaRoutes.ideas}/${string}`>;

export default () => ({
  path: ideaRoutes.ideas,
  element: (
    <PageLoading>
      <AdminIdeasContainer />
    </PageLoading>
  ),
  children: [
    {
      index: true,
      element: (
        <PageLoading>
          <AdminIdeasAll />
        </PageLoading>
      ),
    },
    {
      path: ideaRoutes.ideaId,
      element: (
        <PageLoading>
          <IdeaPreviewIndex goBackUrl="/admin/ideas" />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
