import React from 'react';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

interface Props {}

class DashboardsPage extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps> {
  render() {
    const { children } = this.props;
    const { formatMessage } = this.props.intl;

    const tabs = [
      { label: formatMessage(messages.tabSummary), url: '/admin' },
      { label: formatMessage(messages.tabUsers), url: '/admin/dashboard-users' },
      { label: formatMessage(messages.tabAcquisition), url: '/admin/dashboard-acquisition' },
    ];

    const resource = {
      title: formatMessage(messages.viewPublicResource)
    };

    return (
      <TabbedResource
        resource={resource}
        messages={messages}
        tabs={tabs}
      >
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {children}
      </TabbedResource>
    );
  }
}

export default withRouter(injectIntl(DashboardsPage));
