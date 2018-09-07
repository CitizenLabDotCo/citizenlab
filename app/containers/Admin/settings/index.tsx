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
import GetFeatureFlag from 'resources/GetFeatureFlag';

interface Props {
  showWidgets: boolean;
}

interface State {}

class SettingsPage extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  render() {
    const { children, showWidgets } = this.props;
    const { formatMessage } = this.props.intl;

    const tabs = [
      { label: formatMessage(messages.tabSettings), url: '/admin/settings/general' },
      { label: formatMessage(messages.tabCustomize), url: '/admin/settings/customize' },
      { label: formatMessage(messages.tabPages), url: '/admin/settings/pages' },
      { label: formatMessage(messages.tabRegistration), url: '/admin/settings/registration' },
      { label: formatMessage(messages.tabAreas), url: '/admin/settings/areas' },
    ];
    if (showWidgets) {
      tabs.push({ label: formatMessage(messages.tabWidgets), url: '/admin/settings/widgets' });
    }

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

const SettingsPageWithHocs = withRouter(injectIntl(SettingsPage));
export default (inputProps) => (
  <GetFeatureFlag name="widgets">
    {(hasFeature) => <SettingsPageWithHocs {...inputProps} showWidgets={hasFeature} />}
  </GetFeatureFlag>
);
