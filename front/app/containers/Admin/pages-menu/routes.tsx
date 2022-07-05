import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';
import { Outlet as RouterOutlet } from 'react-router-dom';

const TopInfoForm = lazy(() => import('./containers/BottomInfoForm'));
const BottomInfoForm = lazy(() => import('./containers/BottomInfoForm'));
const HeroBannerForm = lazy(() => import('./containers/HeroBannerForm'));

export default () => ({
  path: 'pages-menu',
  element: (
    <PageLoading>
      <div>
        pages-and-menu home
        <RouterOutlet />
      </div>
    </PageLoading>
  ),
  children: [
    {
      path: 'top-info-section',
      element: (
        <PageLoading>
          <TopInfoForm />
        </PageLoading>
      ),
    },
    {
      path: 'bottom-info-section',
      element: (
        <PageLoading>
          <BottomInfoForm />
        </PageLoading>
      ),
    },
    {
      path: 'homepage-banner',
      element: (
        <PageLoading>
          <HeroBannerForm />
        </PageLoading>
      ),
    },
  ],
});
