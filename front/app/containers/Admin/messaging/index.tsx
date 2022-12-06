import * as React from 'react';
import { adopt } from 'react-adopt';
import { WrappedComponentProps } from 'react-intl';
import { Outlet as RouterOutlet } from 'react-router-dom';
import { isEmpty } from 'lodash-es';
import GetFeatureFlag from 'resources/GetFeatureFlag';
import GetPermission from 'resources/GetPermission';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import messages from './messages';

type Props = {
  canManageAutomatedCampaigns: boolean | null;
  canManageManualCampaigns: boolean | null;
  manualEmailingEnabled: boolean | null;
  automatedEmailingEnabled: boolean | null;
  textingEnabled: boolean | null;
};

interface State {}

class MessagingDashboard extends React.PureComponent<
  Props & WrappedComponentProps & WithRouterProps,
  State
> {
  tabs = () => {
    const {
      intl: { formatMessage },
      location: { pathname },
    } = this.props;
    const tabs: any = [];

    if (
      this.props.canManageManualCampaigns &&
      this.props.manualEmailingEnabled
    ) {
      tabs.push({
        label: formatMessage(messages.tabCustomEmail),
        url: '/admin/messaging/emails/custom',
      });
    }
    if (this.props.textingEnabled) {
      tabs.push({
        label: formatMessage(messages.tabTexting),
        url: '/admin/messaging/texting',
        statusLabel: 'Beta',
      });
    }
    if (
      this.props.canManageAutomatedCampaigns &&
      this.props.automatedEmailingEnabled
    ) {
      tabs.push({
        label: formatMessage(messages.tabAutomatedEmails),
        url: '/admin/messaging/emails/automated',
      });
    }

    if (pathname.match(/\/admin\/messaging$/) && !isEmpty(tabs)) {
      clHistory.push(tabs[0].url);
    }

    return tabs;
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;
    const tabs = this.tabs();

    return (
      <>
        <TabbedResource
          resource={{
            title: formatMessage(messages.titleMessaging),
            subtitle: formatMessage(messages.subtitleMessaging),
          }}
          tabs={this.tabs()}
        >
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          <div id="e2e-messaging-container">
            {isEmpty(tabs) ? (
              <FormattedMessage {...messages.noAccess} />
            ) : (
              <RouterOutlet />
            )}
          </div>
        </TabbedResource>
      </>
    );
  }
}

const MessagingDashboardWithHOCs = withRouter(injectIntl(MessagingDashboard));

const Data = adopt<Props>({
  canManageAutomatedCampaigns: (
    <GetPermission item="automatedCampaign" action="manage" />
  ),
  canManageManualCampaigns: (
    <GetPermission item="manualCampaign" action="manage" />
  ),
  manualEmailingEnabled: <GetFeatureFlag name="manual_emailing" />,
  automatedEmailingEnabled: (
    <GetFeatureFlag name="automated_emailing_control" />
  ),
  textingEnabled: <GetFeatureFlag name="texting" />,
});

export default (inputProps) => (
  <Data>
    {(dataProps) => (
      <MessagingDashboardWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
