import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import {
  pagesBreadcrumb,
  pagesBreadcrumbLink,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';

import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { Outlet as RouterOutlet, useParams } from 'utils/router';

import messages from '../messages';

import SettingsWithPreview from './SettingsWithPreview';
import ViewCustomPageButton from './ViewCustomPageButton';

const CustomPagesEditSettings = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  const { data: customPage } = useCustomPageById(customPageId);
  const canCreateCustomPages = useFeatureFlag({
    name: 'pages',
    onlyCheckAllowed: true,
  });
  // With the builder on, one page replaces the two tabs: the section editors on the content
  // tab no longer change what the page shows.
  const customPageBuilderEnabled = useFeatureFlag({
    name: 'custom_page_builder',
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
              label: formatMessage(pagesBreadcrumb.label),
              link: pagesBreadcrumbLink,
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
                to="/pages/$slug"
                params={{ slug: customPage.data.attributes.slug }}
              />
            ),
          }}
          tabs={
            customPageBuilderEnabled
              ? []
              : [
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
                ]
          }
          contentWrapper={false}
        >
          {customPageBuilderEnabled ? (
            <SettingsWithPreview />
          ) : (
            <RouterOutlet />
          )}
        </TabbedResource>
      )}
    </>
  );
};

export default CustomPagesEditSettings;
