import React from 'react';
import { adopt } from 'react-adopt';

// router
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource, { TabProps } from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import { reject } from 'lodash-es';

export interface InputProps {}

interface DataProps {
  widgetsEnabled: GetFeatureFlagChildProps;
  customTopicsEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class SettingsPage extends React.PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  getTabs = () => {
    const { widgetsEnabled, customTopicsEnabled } = this.props;
    const { formatMessage } = this.props.intl;

    let tabs: TabProps[] = [
      {
        label: formatMessage(messages.tabSettings),
        url: '/admin/settings/general',
      },
      {
        label: formatMessage(messages.tabCustomize),
        url: '/admin/settings/customize',
      },
      {
        label: formatMessage(messages.tabRegistrationFields),
        url: '/admin/settings/registration',
      },
      {
        label: formatMessage(messages.tabTopics),
        url: '/admin/settings/topics',
        name: 'topics',
      },
      {
        label: formatMessage(messages.tabAreas),
        url: '/admin/settings/areas',
      },
      {
        label: formatMessage(messages.tabPages),
        url: '/admin/settings/pages',
      },
      {
        label: formatMessage(messages.tabWidgets),
        url: '/admin/settings/widgets',
        name: 'widgets',
      },
    ];

    const tabHideConditions = {
      topics: function isTopicsTabHidden() {
        if (!customTopicsEnabled) {
          return true;
        }

        return false;
      },
      widgets: function isWidgetsTabHidden() {
        if (!widgetsEnabled) {
          return true;
        }

        return false;
      },
    };

    const tabNames = tabs.map((tab) => tab.name);

    tabNames.forEach((tabName) => {
      if (tabName && tabHideConditions[tabName]()) {
        tabs = reject(tabs, { name: tabName });
      }
    });

    return tabs;
  };

  render() {
    const { children } = this.props;
    const { formatMessage } = this.props.intl;

    const resource = {
      title: formatMessage(messages.pageTitle),
    };

    return (
      <TabbedResource
        resource={resource}
        // TODO: optimization would be to use useMemo for tabs,
        // as they get recalculated on every click
        tabs={this.getTabs()}
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
  customTopicsEnabled: <GetFeatureFlag name="custom_topics" />,
});

export default (inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SettingsPageWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
