import React from 'react';
import CustomPageSettingsForm from '../CustomPageSettingsForm';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import HelmetIntl from 'components/HelmetIntl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import TabbedResource from 'components/admin/TabbedResource';
const CustomPagesNewSettings = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
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
            url: '/admin/pages-menu/custom/new',
          },
        ]}
        contentWrapper={false}
      >
        <CustomPageSettingsForm />
      </TabbedResource>
    </>
  );
};

export default injectIntl(CustomPagesNewSettings);
