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
};

interface State {}

class EmailsDashboard extends React.PureComponent<
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
        label: formatMessage(messages.tabCustom),
        url: '/admin/emails/custom',
      });
    }
    if (
      this.props.canManageAutomatedCampaigns &&
      this.props.automatedEmailingEnabled
    ) {
      tabs.push({
        label: formatMessage(messages.tabAutomated),
        url: '/admin/emails/automated',
      });
    }

    if (pathname.match(/\/admin\/emails$/) && !isEmpty(tabs)) {
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
            title: formatMessage(messages.titleEmails),
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

const EmailsDashboardWithHOCs = withRouter(injectIntl(EmailsDashboard));

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
});

export default (inputProps) => (
  <Data>
    {(dataProps) => <EmailsDashboardWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
