import React, { useState } from 'react';

// module
import { ITab } from 'typings';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

const IdeasPage = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const [tabs] = useState<ITab[]>([
    {
      label: formatMessage(messages.tabManage),
      name: 'manage',
      url: '/admin/ideas',
    },
  ]);

  const resource = {
    title: formatMessage(messages.inputManagerPageTitle),
    subtitle: formatMessage(messages.inputManagerPageSubtitle),
  };

  return (
    <>
      <TabbedResource resource={resource} tabs={tabs}>
        <HelmetIntl
          title={messages.inputManagerMetaTitle}
          description={messages.inputManagerMetaDescription}
        />
        <div id="e2e-input-manager-container">
          <RouterOutlet />
        </div>
      </TabbedResource>
    </>
  );
};

export default injectIntl(IdeasPage);
