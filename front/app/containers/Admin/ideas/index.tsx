import React, { useState } from 'react';

// module
import { InsertConfigurationOptions, ITab } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import Outlet from 'components/Outlet';
import { Outlet as RouterOutlet } from 'react-router-dom';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

const IdeasPage = ({ intl: { formatMessage } }: InjectedIntlProps) => {
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

  const handleData = (data: InsertConfigurationOptions<ITab>) =>
    setTabs(insertConfiguration(data));

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
        <RouterOutlet />
      </TabbedResource>
    </>
  );
};

export default injectIntl(IdeasPage);
