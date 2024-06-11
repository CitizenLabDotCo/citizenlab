import React from 'react';

import { useParams } from 'react-router-dom';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocalize from 'hooks/useLocalize';

import HelmetIntl from 'components/HelmetIntl';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from '../../breadcrumbs';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import { adminCustomPageContentPath } from '../../routes';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

import messages from './messages';
import ProjectsListContent from './ProjectsListContent';

const ProjectList = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const { customPageId } = useParams() as { customPageId: string };
  const { data: customPage } = useCustomPageById(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  return (
    <>
      <HelmetIntl title={messages.pageMetaTitle} />
      <SectionFormWrapper
        title={formatMessage(messages.pageTitle)}
        badge={
          <ShownOnPageBadge
            shownOnPage={customPage.data.attributes.projects_enabled}
          />
        }
        breadcrumbs={[
          {
            label: formatMessage(pagesAndMenuBreadcrumb.label),
            linkTo: pagesAndMenuBreadcrumbLinkTo,
          },
          {
            label: localize(customPage.data.attributes.title_multiloc),
            linkTo: adminCustomPageContentPath(customPageId),
          },
          {
            label: formatMessage(messages.pageTitle),
          },
        ]}
        rightSideCTA={
          <ViewCustomPageButton
            linkTo={`/pages/${customPage.data.attributes.slug}`}
          />
        }
      >
        <ProjectsListContent customPage={customPage.data} />
      </SectionFormWrapper>
    </>
  );
};

export default ProjectList;
