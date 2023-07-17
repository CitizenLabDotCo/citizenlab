import React from 'react';

// components
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';
import ProjectsListContent from './ProjectsListContent';
import HelmetIntl from 'components/HelmetIntl';

// hooks
import useLocalize from 'hooks/useLocalize';
import { useIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';
import useCustomPageById from 'api/custom_pages/useCustomPageById';

// utils
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';
import { adminCustomPageContentPath } from '../../routes';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import messages from './messages';

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
            linkTo: pagesAndMenuBreadcrumb.linkTo,
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
