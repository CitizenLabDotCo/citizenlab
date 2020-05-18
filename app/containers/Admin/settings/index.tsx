import React from 'react';
import { adopt } from 'react-adopt';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// resources
import GetFeatureFlag, { GetFeatureFlagChildProps } from 'resources/GetFeatureFlag';

interface InputProps {}

interface DataProps {
  widgetsEnabled: GetFeatureFlagChildProps;
  customTopicsEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

interface State { }

class SettingsPage extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  render() {
    const { children, widgetsEnabled, customTopicsEnabled } = this.props;
    const { formatMessage } = this.props.intl;

    const tabs = [
      {
        label: formatMessage(messages.tabSettings),
        url: '/admin/settings/general',
      },
      {
        label: formatMessage(messages.tabCustomize),
        url: '/admin/settings/customize',
      },
      {
        label: formatMessage(messages.tabPages),
        url: '/admin/settings/pages',
      },
      {
        label: formatMessage(messages.tabRegistration),
        url: '/admin/settings/registration',
      },
      {
        label: formatMessage(messages.tabAreas),
        url: '/admin/settings/areas',
      }
    ];
    if (customTopicsEnabled) {
      // add topic manager tab after user data (/registration) tab if enabled
      tabs.splice(4, 0, {
        label: formatMessage(messages.tabTopics),
        url: '/admin/settings/topics',
      });
    }
    if (widgetsEnabled) {
      tabs.push({
        label: formatMessage(messages.tabWidgets),
        url: '/admin/settings/widgets',
      });
    }

    const resource = {
      title: formatMessage(messages.pageTitle)
    };

    return (
      <TabbedResource
        resource={resource}
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

const Data = adopt<DataProps, InputProps>({
  widgetsEnabled: <GetFeatureFlag name="widgets" />,
  customTopicsEnabled: <GetFeatureFlag name="custom_topics" />
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <SettingsPageWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
