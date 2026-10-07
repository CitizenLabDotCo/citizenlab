import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  pagesBreadcrumb,
  pagesBreadcrumbLink,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';

import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import NewCustomPage from './NewCustomPage';

const CustomPagesNewSettings = () => {
  const { formatMessage } = useIntl();
  const canCreateCustomPages = useFeatureFlag({
    name: 'pages',
    onlyCheckAllowed: true,
  });
  // Matches the edit page, which drops its tabs when the builder is on.
  const customPageBuilderEnabled = useFeatureFlag({
    name: 'custom_page_builder',
  });
  return (
    <>
      <HelmetIntl title={messages.newCustomPageMetaTitle} />
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(pagesBreadcrumb.label),
              link: pagesBreadcrumbLink,
            },
            { label: formatMessage(messages.newCustomPagePageTitle) },
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
            title: formatMessage(messages.newCustomPagePageTitle),
          }}
          tabs={
            customPageBuilderEnabled
              ? []
              : [
                  {
                    label: formatMessage(messages.pageSettingsTab),
                    name: 'settings',
                    url: '/admin/pages-menu/pages/new',
                  },
                ]
          }
          contentWrapper={false}
        >
          <NewCustomPage />
        </TabbedResource>
      )}
    </>
  );
};

export default CustomPagesNewSettings;
