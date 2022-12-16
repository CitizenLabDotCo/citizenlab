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
import useCustomPage from 'hooks/useCustomPage';

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
  const customPage = useCustomPage({ customPageId });

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
            shownOnPage={customPage.attributes.projects_enabled}
          />
        }
        breadcrumbs={[
          {
            label: formatMessage(pagesAndMenuBreadcrumb.label),
            linkTo: pagesAndMenuBreadcrumb.linkTo,
          },
          {
            label: localize(customPage.attributes.title_multiloc),
            linkTo: adminCustomPageContentPath(customPageId),
          },
          {
            label: formatMessage(messages.pageTitle),
          },
        ]}
        rightSideCTA={
          <ViewCustomPageButton
            linkTo={`/pages/${customPage.attributes.slug}`}
          />
        }
      >
        <ProjectsListContent customPage={customPage} />
      </SectionFormWrapper>
    </>
  );
};

export default ProjectList;
