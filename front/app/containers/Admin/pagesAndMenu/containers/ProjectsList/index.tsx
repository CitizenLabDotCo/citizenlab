import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';
import Warning from 'components/UI/Warning';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ShownOnPageBadge from '../../components/ShownOnPageBadge';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

// hooks
import useLocalize from 'hooks/useLocalize';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';
import useCustomPage from 'hooks/useCustomPage';

// utils
import { pagesAndMenuBreadcrumb } from '../../breadcrumbs';
import {
  adminCustomPageContentPath,
  adminCustomPageSettingsPath,
} from '../../routes';
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
    // add helmet intl
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
        <ViewCustomPageButton linkTo={`/pages/${customPage.attributes.slug}`} />
      }
    >
      <Box display="flex" flexDirection="column">
        <Box mb="28px">
          <Warning>
            <FormattedMessage
              {...messages.sectionDescription}
              values={{
                pageSettingsLink: (
                  <Link to={`${adminCustomPageSettingsPath(customPageId)}`}>
                    <FormattedMessage {...messages.pageSettingsLinkText} />
                  </Link>
                ),
              }}
            />
          </Warning>
        </Box>
      </Box>
    </SectionFormWrapper>
  );
};

export default ProjectList;
