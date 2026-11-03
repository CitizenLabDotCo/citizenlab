import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocalize from 'hooks/useLocalize';

import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import { pagesBreadcrumb, pagesBreadcrumbLink } from '../../breadcrumbs';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import { adminCustomPageContentLink } from '../../routes';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

import messages from './messages';
import ProjectsListContent from './ProjectsListContent';

const ProjectList = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  const { data: customPage } = useCustomPageById(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  // Folders can only be listed when filtering by space: areas and tags are
  // project-level associations, so the list is projects-only in those cases.
  const showsFolders =
    customPage.data.attributes.projects_filter_type === 'spaces';
  const pageTitle = showsFolders
    ? messages.pageTitle
    : messages.projectsPageTitle;
  const pageMetaTitle = showsFolders
    ? messages.pageMetaTitle
    : messages.projectsPageMetaTitle;

  return (
    <>
      <HelmetIntl title={pageMetaTitle} />
      <SectionFormWrapper
        title={formatMessage(pageTitle)}
        badge={
          <ShownOnPageBadge
            shownOnPage={customPage.data.attributes.projects_enabled}
          />
        }
        breadcrumbs={[
          {
            label: formatMessage(pagesBreadcrumb.label),
            link: pagesBreadcrumbLink,
          },
          {
            label: localize(customPage.data.attributes.title_multiloc),
            link: adminCustomPageContentLink(customPageId),
          },
          {
            label: formatMessage(pageTitle),
          },
        ]}
        rightSideCTA={
          <ViewCustomPageButton
            to="/pages/$slug"
            params={{ slug: customPage.data.attributes.slug }}
          />
        }
      >
        <ProjectsListContent customPage={customPage.data} />
      </SectionFormWrapper>
    </>
  );
};

export default ProjectList;
