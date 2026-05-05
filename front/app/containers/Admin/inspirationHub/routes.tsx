import React, { lazy } from 'react';

import * as yup from 'yup';

import HelmetIntl from 'components/HelmetIntl';
import PageLoading from 'components/UI/PageLoading';

import { createRoute, Outlet as RouterOutlet } from 'utils/router';

import { adminRoute } from '../routes';
import sidebarMessages from '../sideBar/messages';

import messages from './messages';

const InspirationHub = lazy(() => import('.'));

const inspirationHubRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'inspiration-hub',
  component: () => (
    <PageLoading>
      <HelmetIntl
        title={sidebarMessages.inspirationHub}
        description={messages.inspirationHubDescription}
      />
      <RouterOutlet />
    </PageLoading>
  ),
});

// Inspiration hub uses ransack-style bracket-notation params (e.g. `q[topic_id_in]`).
// `_in]`-suffixed params are arrays of strings; others are scalar strings.
// `project_id` opens the side drawer for a project.
const inspirationHubIndexSearchSchema = yup.object({
  'q[tenant_country_code_in]': yup.array().of(yup.string()).optional(),
  'q[phases_participation_method_in]': yup.array().of(yup.string()).optional(),
  'q[tenant_population_group_in]': yup.array().of(yup.string()).optional(),
  'q[topic_id_in]': yup.array().of(yup.string()).optional(),
  'q[practical_end_at_gteq]': yup.string().optional(),
  'q[practical_end_at_lt]': yup.string().optional(),
  'q[title_en_or_description_en_or_tenant_name_or_title_multiloc_text_cont]':
    yup.string().optional(),
  'q[pin_country_code_eq]': yup.string().optional(),
  'q[s]': yup.string().optional(),
  project_id: yup.string().optional(),
});

const inspirationHubIndexRoute = createRoute({
  getParentRoute: () => inspirationHubRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) =>
    inspirationHubIndexSearchSchema.validateSync(search, {
      stripUnknown: true,
    }),
  component: () => (
    <PageLoading>
      <InspirationHub />
    </PageLoading>
  ),
});

const createAdminInspirationHubRoutes = () => {
  return inspirationHubRoute.addChildren([inspirationHubIndexRoute]);
};

export default createAdminInspirationHubRoutes;
