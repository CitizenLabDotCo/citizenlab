import * as React from 'react';
import { isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import clHistory from 'utils/cl-router/history';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import { Outlet as RouterOutlet } from 'react-router-dom';

interface DataProps {
  canManageAutomatedCampaigns: GetPermissionChildProps;
  canManageManualCampaigns: GetPermissionChildProps;
  manualEmailingEnabled: GetFeatureFlagChildProps;
  automatedEmailingEnabled: GetFeatureFlagChildProps;
  textingEnabled: GetFeatureFlagChildProps;
}

interface Props extends DataProps {}

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
    const tabs: {
      name: string;
      label: string;
      url: string;
      statusLabel?: string;
    }[] = [];

    if (
      this.props.canManageManualCampaigns &&
      this.props.manualEmailingEnabled
    ) {
      tabs.push({
        name: 'manual-emails',
        label: formatMessage(messages.tabCustomEmail),
        url: '/admin/messaging/emails/custom',
      });
    }
    if (this.props.textingEnabled) {
      tabs.push({
        name: 'texting',
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
        name: 'automated-emails',
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

const Data = adopt({
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

export default () => (
  <Data>
    {(dataProps: DataProps) => <MessagingDashboardWithHOCs {...dataProps} />}
  </Data>
);
