import TabbedResource from 'components/admin/TabbedResource';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
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
