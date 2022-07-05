import React, { lazy } from 'react';
import PageLoading from 'components/UI/PageLoading';

const TopInfoForm = lazy(() => import('./containers/BottomInfoForm'));
const BottomInfoForm = lazy(() => import('./containers/BottomInfoForm'));
const HeroBannerForm = lazy(() => import('./containers/HeroBannerForm'));

export default () => [
  {
    path: 'pages-and-menu',
    element: (
      <PageLoading>
        <div>pages-and-menu home</div>
      </PageLoading>
    ),
  },
  {
    path: 'pages-and-menu/top-info-section',
    element: (
      <PageLoading>
        <TopInfoForm />
      </PageLoading>
    ),
  },
  {
    path: 'pages-and-menu/bottom-info-section',
    element: (
      <PageLoading>
        <BottomInfoForm />
      </PageLoading>
    ),
  },
  {
    path: 'pages-and-menu/homepage-banner',
    element: (
      <PageLoading>
        <HeroBannerForm />
      </PageLoading>
    ),
  },
];
