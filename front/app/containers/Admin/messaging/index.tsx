import * as React from 'react';
import { isEmpty } from 'lodash-es';
import { adopt } from 'react-adopt';
import clHistory from 'utils/cl-router/history';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';
import messages from './messages';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import { Outlet as RouterOutlet, useLocation } from 'react-router-dom';

interface DataProps {
  canManageAutomatedCampaigns: GetPermissionChildProps;
  canManageManualCampaigns: GetPermissionChildProps;
  manualEmailingEnabled: GetFeatureFlagChildProps;
  automatedEmailingEnabled: GetFeatureFlagChildProps;
  textingEnabled: GetFeatureFlagChildProps;
}

interface Props extends DataProps {}

const MessagingDashboard = ({
  canManageAutomatedCampaigns,
  canManageManualCampaigns,
  manualEmailingEnabled,
  automatedEmailingEnabled,
  textingEnabled,
}: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const getTabs = () => {
    const tabs: {
      name: string;
      label: string;
      url: string;
      statusLabel?: string;
    }[] = [];

    if (canManageManualCampaigns && manualEmailingEnabled) {
      tabs.push({
        name: 'manual-emails',
        label: formatMessage(messages.tabCustomEmail),
        url: '/admin/messaging/emails/custom',
      });
    }
    if (textingEnabled) {
      tabs.push({
        name: 'texting',
        label: formatMessage(messages.tabTexting),
        url: '/admin/messaging/texting',
        statusLabel: 'Beta',
      });
    }
    if (canManageAutomatedCampaigns && automatedEmailingEnabled) {
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

  const tabs = getTabs();

  return (
    <>
      <TabbedResource
        resource={{
          title: formatMessage(messages.titleMessaging),
          subtitle: formatMessage(messages.subtitleMessaging),
        }}
        tabs={tabs}
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
};

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
  <Data>{(dataProps: DataProps) => <MessagingDashboard {...dataProps} />}</Data>
);
