import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import TabbedResource from 'components/admin/TabbedResource';
import messages from './messages';
import Outlet from 'components/Outlet';

const Containers = ({ intl: { formatMessage } }: InjectedIntlProps) => {
  // It's better to avoid using this feature flag in the core
  // https://github.com/CitizenLabDotCo/citizenlab/pull/2162#discussion_r916522447
  const customizableNavbarEnabled = useFeatureFlag({
    name: 'customizable_navbar',
  });
  return (
    <>
      <Outlet id="app.containers.Admin.pages-menu.index" />
      {customizableNavbarEnabled || (
        <TabbedResource
          resource={{
            title: formatMessage(messages.pageHeader),
          }}
        >
          <RouterOutlet />
        </TabbedResource>
      )}
    </>
  );
};

export default injectIntl(Containers);
