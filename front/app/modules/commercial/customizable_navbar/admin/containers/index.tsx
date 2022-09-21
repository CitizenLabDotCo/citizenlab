import React from 'react';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'react-intl';
import messages from './messages';

const PagesMenu = ({ intl: { formatMessage } }: WrappedComponentProps) => {
  return (
    <TabbedResource
      resource={{
        title: formatMessage(messages.pageHeader),
        subtitle: formatMessage(messages.pageSubtitle),
      }}
    >
      <RouterOutlet />
    </TabbedResource>
  );
};

export default injectIntl(PagesMenu);
