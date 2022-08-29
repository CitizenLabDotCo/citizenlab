import React from 'react';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import SectionFormWrapper from 'containers/Admin/pagesAndMenu/components/SectionFormWrapper';

const CreateCustomPageHookForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
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
    </SectionFormWrapper>
  );
};

export default injectIntl(CreateCustomPageHookForm);
