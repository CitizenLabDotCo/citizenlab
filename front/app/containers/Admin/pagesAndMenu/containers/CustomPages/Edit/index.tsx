import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';

import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import ViewCustomPageButton from './ViewCustomPageButton';

const CustomPagesEditSettings = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { customPageId } = useParams() as { customPageId: string };
  const { data: customPage } = useCustomPageById(customPageId);
  const canCreateCustomPages = useFeatureFlag({
    name: 'pages',
    onlyCheckAllowed: true,
  });

  if (isNilOrError(customPage)) {
    return null;
  }

  const pageTitleMultiloc = customPage.data.attributes.title_multiloc;
  return (
    <>
      <HelmetIntl title={messages.editCustomPageMetaTitle} />
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumbLinkTo,
            },
            { label: localize(pageTitleMultiloc) },
          ]}
        />
      </Box>
      {!canCreateCustomPages ? (
        <Box padding="20px" background="white">
          <Warning>
            {formatMessage(messages.contactGovSuccessToAccessPages)}
          </Warning>
        </Box>
      ) : (
        <TabbedResource
          resource={{
            title: localize(pageTitleMultiloc),
            rightSideCTA: (
              <ViewCustomPageButton
                linkTo={`/pages/${customPage.data.attributes.slug}`}
              />
            ),
          }}
          tabs={[
            {
              label: formatMessage(messages.pageSettingsTab),
              name: 'settings',
              url: `/admin/pages-menu/pages/${customPageId}/settings`,
            },
            {
              label: formatMessage(messages.pageContentTab),
              name: 'content',
              url: `/admin/pages-menu/pages/${customPageId}/content`,
            },
          ]}
          contentWrapper={false}
        >
          <RouterOutlet />
        </TabbedResource>
      )}
    </>
  );
};

export default CustomPagesEditSettings;
