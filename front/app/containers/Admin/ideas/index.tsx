import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
// module
import { InsertConfigurationOptions, ITab } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import { insertConfiguration } from 'utils/moduleUtils';
// components
import HelmetIntl from 'components/HelmetIntl';
import Outlet from 'components/Outlet';
import TabbedResource from 'components/admin/TabbedResource';
// i18n
import messages from './messages';

const IdeasPage = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  const [tabs, setTabs] = useState<ITab[]>([
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

  const handleData = (data: InsertConfigurationOptions<ITab>) => {
    setTabs((tabs) => insertConfiguration(data)(tabs));
  };

  return (
    <>
      <Outlet
        id="app.containers.Admin.ideas.tabs"
        formatMessage={formatMessage}
        onData={handleData}
      />
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
