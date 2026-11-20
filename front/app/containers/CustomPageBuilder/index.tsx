import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import { isContentBuilderPage } from 'api/custom_pages/util';
import useProjectById from 'api/projects/useProjectById';

import { adminCustomPageSettingsPath } from 'containers/Admin/pagesAndMenu/routes';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

import { type TypedLinkProps } from 'utils/cl-router/Link';
import { useLocation, useParams } from 'utils/router';

import CustomPageBuilderPage from './CustomPageBuilderPage';

const CustomPageBuilder = () => {
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  // Opening the builder provisions a layout, so bail for a page not on the builder: a typed URL
  // for one would write data otherwise.
  const { data: customPage } = useCustomPageById(customPageId);
  const projectId = customPage?.data.attributes.project_id;
  const { data: project } = useProjectById(projectId);
  useEnsureCustomPageLayout(customPageId);
  const { searchStr } = useLocation();

  if (!customPage || !isContentBuilderPage(customPage.data)) {
    return null;
  }
  // A project's page lives under the project, in the admin and on the site.
  if (projectId && !project) return null;

  const pageSlug = customPage.data.attributes.slug;
  const backPath = `${
    projectId
      ? `${adminProjectsProjectPath(projectId)}/pages/${customPageId}`
      : adminCustomPageSettingsPath(customPageId)
  }${searchStr}`;
  const previewLink: TypedLinkProps = project
    ? {
        to: '/projects/$slug/pages/$pageSlug',
        params: { slug: project.data.attributes.slug, pageSlug },
      }
    : { to: '/pages/$slug', params: { slug: pageSlug } };

  return (
    <CustomPageBuilderPage
      staticPageId={customPageId}
      backPath={backPath}
      previewLink={previewLink}
      titleMultiloc={customPage.data.attributes.title_multiloc}
    />
  );
};

export default CustomPageBuilder;
