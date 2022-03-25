import * as React from 'react';
import { isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import GetPermission from 'resources/GetPermission';
import GetFeatureFlag from 'resources/GetFeatureFlag';

type Props = {
  canManageAutomatedCampaigns: boolean | null;
  canManageManualCampaigns: boolean | null;
  manualEmailingEnabled: boolean | null;
  automatedEmailingEnabled: boolean | null;
  textingEnabled: boolean | null;
};

interface State {}

class MessagingDashboard extends React.PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
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
      children,
      intl: { formatMessage },
    } = this.props;
    const tabs = this.tabs();

    return (
      <>
        <TabbedResource
          resource={{
            title: formatMessage(messages.titleMessaging),
            // note: update subtitle once SMS feature is live.
            // right now it's accurate in only referring to email functionality
            // It may even be better to make the subtitle content sensitive to each of the possible messaging features
            // and display different copy depending on which messaging feature(s) is/are active:
            // Manual emails / automated emails / SMS
            subtitle: formatMessage(messages.subtitleEmails),
          }}
          tabs={this.tabs()}
        >
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          {isEmpty(tabs) ? (
            <FormattedMessage {...messages.noAccess} />
          ) : (
            children
          )}
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
