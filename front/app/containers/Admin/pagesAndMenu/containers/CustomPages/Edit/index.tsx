import React from 'react';
import { WrappedComponentProps } from 'react-intl';
// routing
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';
// components
import { Box } from '@citizenlab/cl2-component-library';
// hooks
import useCustomPage from 'hooks/useCustomPage';
import useLocalize from 'hooks/useLocalize';
import { injectIntl } from 'utils/cl-intl';
// utils
import { isNilOrError } from 'utils/helperUtils';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import HelmetIntl from 'components/HelmetIntl';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import TabbedResource from 'components/admin/TabbedResource';
// i18n
import messages from '../messages';
import ViewCustomPageButton from './ViewCustomPageButton';

const CustomPagesEditSettings = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const customPage = useCustomPage({ customPageId });

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
          rightSideCTA: (
            <ViewCustomPageButton
              linkTo={`/pages/${customPage.attributes.slug}`}
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
    </>
  );
};

export default injectIntl(CustomPagesEditSettings);
