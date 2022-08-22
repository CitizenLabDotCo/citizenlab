import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

const CustomPages = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  return (
    <TabbedResource
      resource={{
        title: 'test',
      }}
      tabs={[
        {
          label: 'Page settings',
          name: '',
          url: '',
        },
        {
          label: 'Page content',
          name: '',
          url: '',
        },
      ]}
    >
      {/* <HelmetIntl
        title={'messages.inputManagerMetaTitle'}
        description={messages.inputManagerMetaDescription}
      /> */}
      <RouterOutlet />
    </TabbedResource>
  );
};

export default injectIntl(CustomPages);
