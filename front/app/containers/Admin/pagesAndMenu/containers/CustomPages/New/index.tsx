import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import {
  pagesAndMenuBreadcrumb,
  pagesAndMenuBreadcrumbLinkTo,
} from 'containers/Admin/pagesAndMenu/breadcrumbs';

import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import Breadcrumbs from 'components/UI/Breadcrumbs';

import { injectIntl } from 'utils/cl-intl';

import messages from '../messages';

import NewCustomPage from './NewCustomPage';

const CustomPagesNewSettings = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  return (
    <>
      <HelmetIntl title={messages.newCustomPageMetaTitle} />
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumbLinkTo,
            },
            { label: formatMessage(messages.newCustomPagePageTitle) },
          ]}
        />
      </Box>
      <TabbedResource
        resource={{
          title: formatMessage(messages.newCustomPagePageTitle),
        }}
        tabs={[
          {
            label: formatMessage(messages.pageSettingsTab),
            name: 'settings',
            url: '/admin/pages-menu/pages/new',
          },
        ]}
        contentWrapper={false}
      >
        <NewCustomPage />
      </TabbedResource>
    </>
  );
};

export default injectIntl(CustomPagesNewSettings);
