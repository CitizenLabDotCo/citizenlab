import React from 'react';

// components
import TabbedResource from 'components/admin/TabbedResource';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

// i18n
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import { Box } from '@citizenlab/cl2-component-library';
import Breadcrumbs from 'components/UI/Breadcrumbs';
import { pagesAndMenuBreadcrumb } from 'containers/Admin/pagesAndMenu/breadcrumbs';
// import useLocalize from 'hooks/useLocalize';
// import { isNilOrError } from 'utils/helperUtils';

// routing
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

const CustomPagesEditSettings = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  // const localize = useLocalize();
  // const customPage = useCustomPage(customPageId);

  // if (!isNilOrError(customPage)) {
  // const pageTitleMultiloc = customPage.attributes.title_multiloc;
  const { customPageId } = useParams();

  if (!customPageId) {
    return null;
  }

  return (
    <SectionFormWrapper>
      <HelmetIntl title={messages.editCustomPageMetaTitle} />
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
    </SectionFormWrapper>
  );
  // }

  // return null;
};

export default injectIntl(CustomPagesEditSettings);
