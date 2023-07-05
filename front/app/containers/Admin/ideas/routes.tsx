import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));
import IdeaPreviewIndex from 'components/admin/PostManager/components/IdeaPreviewIndex';

export default () => ({
  path: 'ideas',
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
      path: ':ideaId',
      element: (
        <PageLoading>
          <IdeaPreviewIndex goBackUrl="/admin/ideas" />
        </PageLoading>
      ),
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
