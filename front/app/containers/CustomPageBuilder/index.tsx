import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import { isOnContentBuilder } from 'api/custom_pages/util';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { adminCustomPageSettingsPath } from 'containers/Admin/pagesAndMenu/routes';

import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

import { useParams } from 'utils/router';

import CustomPageBuilderPage from './CustomPageBuilderPage';

const CustomPageBuilder = () => {
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  // The page is gated, not just the link to it: opening the builder provisions a layout, so
  // a typed URL on a tenant without the feature, or for a page not on the builder, would write
  // data.
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { data: customPage } = useCustomPageById(customPageId);
  const projectId = customPage?.data.attributes.project_id;
  const { data: project } = useProjectById(projectId);
  useEnsureCustomPageLayout(customPageId);

  if (!featureEnabled || !customPage || !isOnContentBuilder(customPage.data)) {
    return null;
  }
  // A project's page lives under the project, in the admin and on the site.
  if (projectId && !project) return null;

  const pageSlug = customPage.data.attributes.slug;
  const backPath = `${
    projectId
      ? `/admin/projects/${projectId}/pages/${customPageId}`
      : adminCustomPageSettingsPath(customPageId)
  }${window.location.search}`;

  return (
    <CustomPageBuilderPage
      staticPageId={customPageId}
      backPath={backPath}
      previewLink={
        project
          ? {
              to: '/projects/$slug/pages/$pageSlug',
              params: { slug: project.data.attributes.slug, pageSlug },
            }
          : { to: '/pages/$slug', params: { slug: pageSlug } }
      }
      titleMultiloc={customPage.data.attributes.title_multiloc}
    />
  );
};

export default CustomPageBuilder;
