import React from 'react';
import TabbedResource from 'components/admin/TabbedResource';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const PagesMenu = ({ intl: { formatMessage } }: InjectedIntlProps) => {
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
