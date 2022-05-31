import React, { lazy } from 'react';
import Loading from 'components/UI/Loading';
import moduleConfiguration from 'modules';

const AdminIdeasContainer = lazy(() => import('./index'));
const AdminIdeasAll = lazy(() => import('./all'));

export default () => ({
  path: 'ideas',
  element: (
    <Loading admin>
      <AdminIdeasContainer />
    </Loading>
  ),
  children: [
    {
      index: true,
      element: (
        <Loading admin>
          <AdminIdeasAll />
        </Loading>
      ),
    },
    ...moduleConfiguration.routes['admin.ideas'],
  ],
});
