import React from 'react';

// components
import TabbedResource from 'components/admin/TabbedResource';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';

// i18n
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useCustomPage from 'hooks/useCustomPage';

// routing
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

const CustomPagesEditSettings = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage(customPageId);

  if (isNilOrError(customPage)) {
    return null;
  }

  const pageTitleMultiloc = customPage.attributes.title_multiloc;
  return (
    <>
      <HelmetIntl title={messages.editCustomPageMetaTitle} />
      <Box mb="16px">
        <Breadcrumbs
          breadcrumbs={[
            {
              label: formatMessage(pagesAndMenuBreadcrumb.label),
              linkTo: pagesAndMenuBreadcrumb.linkTo,
            },
            { label: localize(pageTitleMultiloc) },
          ]}
        />
      </Box>
      <TabbedResource
        resource={{
          title: localize(pageTitleMultiloc),
        }}
        tabs={[
          {
            label: formatMessage(messages.pageSettingsTab),
            name: 'settings',
            url: `/admin/pages-menu/custom/${customPageId}/settings`,
          },
          {
            label: formatMessage(messages.pageContentTab),
            name: 'content',
            url: `/admin/pages-menu/custom/${customPageId}/content`,
          },
        ]}
        contentWrapper={false}
      >
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default injectIntl(CustomPagesEditSettings);
