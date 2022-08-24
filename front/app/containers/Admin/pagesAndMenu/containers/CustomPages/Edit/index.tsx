import React from 'react';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
// import useLocalize from 'hooks/useLocalize';
// import { isNilOrError } from 'utils/helperUtils';

const CustomPagesEditSettings = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  // const localize = useLocalize();
  // const customPage = useCustomPage(customPageId);

  // if (!isNilOrError(customPage)) {
  // const pageTitleMultiloc = customPage.attributes.title_multiloc;

  return (
    <>
      <HelmetIntl
        title={messages.editCustomPageMetaTitle}
        description={messages.editCustomPageMetaDescription}
      />
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            // { label: localize(pageTitleMultiloc) },
          ]}
        />
      </Box>
      <TabbedResource
        resource={{
          title: formatMessage(messages.editCustomPagePageTitle),
          // The page title will be the final value here
          // title: localize(pageTitleMultiloc),
        }}
        tabs={[
          {
            label: formatMessage(messages.pageSettingsTab),
            name: 'settings',
            url: '/admin/pages-menu/custom/edit/settings',
          },
          {
            label: formatMessage(messages.pageContentTab),
            name: 'content',
            url: '/admin/pages-menu/custom/edit/content',
          },
        ]}
        contentWrapper={false}
      >
        <RouterOutlet />
      </TabbedResource>
    </>
  );
  // }

  // return null;
};

export default injectIntl(CustomPagesEditSettings);
