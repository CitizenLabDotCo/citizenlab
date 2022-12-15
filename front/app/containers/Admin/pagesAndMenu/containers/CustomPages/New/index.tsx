import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import HelmetIntl from 'components/HelmetIntl';
import messages from '../messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import NewCustomPage from './NewCustomPage';
import TabbedResource from 'components/admin/TabbedResource';

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
              linkTo: pagesAndMenuBreadcrumb.linkTo,
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
