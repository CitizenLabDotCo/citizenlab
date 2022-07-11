import React from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import TabbedResource from 'components/admin/TabbedResource';
import messages from './messages';
import Outlet from 'components/Outlet';

const Containers = ({ intl: { formatMessage } }: InjectedIntlProps) => {
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
