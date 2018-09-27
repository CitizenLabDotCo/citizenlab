import * as React from 'react';
import { adopt } from 'react-adopt';
import { injectIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';
import GetPermission from 'resources/GetPermission';

type Props = {
  canManageAutomatedCampaigns: boolean | null;
  canManageManualCampaigns: boolean | null;
};

type State = {};

class EmailsDashboard extends React.PureComponent<Props & InjectedIntlProps, State> {

  tabs = () => {
    const { intl: { formatMessage }, canManageAutomatedCampaigns, canManageManualCampaigns } = this.props;
    const tabs: any = [];
    if (canManageManualCampaigns) {
      tabs.push({ label: formatMessage(messages.tabManual), url: '/admin/emails/manual' });
    }
    if (canManageAutomatedCampaigns) {
      tabs.push({ label: formatMessage(messages.tabAutomated), url: '/admin/emails/automated' });
    }
    return tabs;
  }

  render() {
    const { children, intl: { formatMessage } } = this.props;

    return (
      <TabbedResource
        resource={{ title: formatMessage(messages.titleEmails) }}
        messages={messages}
        tabs={this.tabs()}
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

const EmailsDashboardWithHOCs = injectIntl(EmailsDashboard);

const Data = adopt<Props, {}>({
  canManageAutomatedCampaigns: <GetPermission item="automatedCampaigns" action="manage" />,
  canManageManualCampaigns: <GetPermission item="manualCampaigns" action="manage" />,
});

export default (inputProps) => (
  <Data>
    {dataProps => <EmailsDashboardWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
