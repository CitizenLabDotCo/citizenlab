import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import moduleConfiguration from 'modules';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));
import PostPreviewIndex from 'components/admin/PostManager/components/LazyPostPreview';

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
      children: [
        {
          path: ':ideaId',
          element: (
            <PageLoading>
              <PostPreviewIndex />
            </PageLoading>
          ),
        },
      ],
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
