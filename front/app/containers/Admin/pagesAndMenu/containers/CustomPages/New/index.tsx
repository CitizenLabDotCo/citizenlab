import React from 'react';
import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';
import messages from '../messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import CustomPageSettingsForm from '../CustomPageSettingsForm';

const CreateCustomPageHookForm = ({
  intl: { formatMessage },
}: InjectedIntlProps) => {
  return (
    <>
      <HelmetIntl
        title={messages.newCustomPageMetaTitle}
        description={messages.newCustomPageMetaDescription}
      />
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

export default injectIntl(CreateCustomPageHookForm);
