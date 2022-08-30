import React from 'react';

// components
import TabbedResource from 'components/admin/TabbedResource';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// routing
import { Outlet as RouterOutlet, useParams } from 'react-router-dom';

const CreateCustomPageHookForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  const { customPageId } = useParams();

  if (!customPageId) {
    return null;
  }

  return (
    <SectionFormWrapper>
      <HelmetIntl title={messages.editCustomPageMetaTitle} />
      <TabbedResource
        resource={{
          title: formatMessage(messages.editCustomPagePageTitle),
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
};

export default injectIntl(CreateCustomPageHookForm);
