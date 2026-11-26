import React, { lazy } from 'react';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { createRoute } from 'utils/router';

import { adminRoute } from '../routes';
import sidebarMessages from '../sideBar/messages';

const ProductFeedback = lazy(() => import('.'));

const productFeedbackRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'product-feedback',
  component: () => (
    <PageLoading>
      <HelmetIntl title={sidebarMessages.productFeedback} />
      <ProductFeedback />
    </PageLoading>
  ),
});

const createAdminProductFeedbackRoutes = () => productFeedbackRoute;

export default createAdminProductFeedbackRoutes;
