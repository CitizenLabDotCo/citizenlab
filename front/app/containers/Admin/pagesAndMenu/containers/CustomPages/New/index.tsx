import React from 'react';
import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import CustomPagesNew from './CustomPagesNew';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

const CreateCustomPageHookForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  return (
    <>
      <HelmetIntl
        title={messages.newCustomPageMetaTitle}
        description={messages.newCustomPageMetaDescription}
      />
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
        <CustomPagesNew />
      </TabbedResource>
    </>
  );
};

export default injectIntl(CreateCustomPageHookForm);
