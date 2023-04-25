import React, { useState } from 'react';

// router
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import { InsertConfigurationOptions, ITab } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';
import Outlet from 'components/Outlet';

const SettingsPage = () => {
  const { formatMessage } = useIntl();

  const [tabs, setTabs] = useState<ITab[]>([
    {
      name: 'general',
      label: formatMessage(messages.tabSettings),
      url: '/admin/settings/general',
    },
    {
      name: 'customize',
      label: formatMessage(messages.tabCustomize),
      url: '/admin/settings/customize',
    },
    {
      name: 'registration',
      label: formatMessage(messages.tabRegistration),
      url: '/admin/settings/registration',
    },
    {
      label: formatMessage(messages.tabTopics),
      name: 'topics',
      url: '/admin/settings/topics',
    },
    {
      name: 'areas',
      label: formatMessage(messages.tabAreas),
      url: '/admin/settings/areas',
    },
    {
      name: 'policies',
      label: formatMessage(messages.tabPolicies),
      url: '/admin/settings/policies',
    },
  ]);

  const handleData = (insertTabOptions: InsertConfigurationOptions<ITab>) => {
    setTabs(insertConfiguration(insertTabOptions)(tabs));
  };

  const resource = {
    title: formatMessage(messages.pageTitle),
  };

  return (
    <>
      <Outlet id="app.containers.Admin.settings.tabs" onData={handleData} />
      <TabbedResource resource={resource} tabs={tabs}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <div id="e2e-settings-container">
          <RouterOutlet />
        </div>
      </TabbedResource>
    </>
  );
};

export default SettingsPage;
