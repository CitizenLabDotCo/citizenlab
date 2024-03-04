import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import Breadcrumbs from 'components/UI/Breadcrumbs';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useLocalize from 'hooks/useLocalize';

import messages from '../messages';

import ViewCustomPageButton from './ViewCustomPageButton';

const CustomPagesEditSettings = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const localize = useLocalize();
  const { customPageId } = useParams() as { customPageId: string };
  const { data: customPage } = useCustomPageById(customPageId);

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
    </>
  );
};

export default injectIntl(CustomPagesEditSettings);
