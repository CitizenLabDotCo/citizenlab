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
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import { reject } from 'lodash-es';
import Outlet from 'components/Outlet';
import { ITab } from 'typings';

export interface InputProps {}

interface DataProps {
  widgetsEnabled: GetFeatureFlagChildProps;
  customTopicsEnabled: GetFeatureFlagChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  tabs: ITab[];
}

class SettingsPage extends React.PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  constructor(props) {
    super(props);
    const { formatMessage } = this.props.intl;

    this.state = {
      tabs: [
        {
          name: 'general',
          label: formatMessage(messages.tabSettings),
          url: '/admin/settings/general',
        },
        {
          name: 'customize',
          label: formatMessage(messages.tabCustomize),
          url: '/admin/settings/customize',
        },
        {
          label: formatMessage(messages.tabTopics),
          url: '/admin/settings/topics',
          name: 'topics',
        },
        {
          name: 'areas',
          label: formatMessage(messages.tabAreas),
          url: '/admin/settings/areas',
        },
        {
          name: 'pages',
          label: formatMessage(messages.tabPages),
          url: '/admin/settings/pages',
        },
        {
          label: formatMessage(messages.tabWidgets),
          url: '/admin/settings/widgets',
          name: 'widgets',
        },
      ],
    };
  }

  insertTab = ({
    tabConfiguration,
    insertAfterTabName,
  }: {
    tabConfiguration: ITab;
    insertAfterTabName?: string;
  }) => {
    this.setState(({ tabs }) => {
      const insertIndex =
        tabs.findIndex((tab) => tab.name === insertAfterTabName) + 1;
      if (insertIndex > 0) {
        return {
          tabs: [
            ...tabs.slice(0, insertIndex),
            tabConfiguration,
            ...tabs.slice(insertIndex),
          ],
        };
      }
      return { tabs: [...tabs, tabConfiguration] };
    });
  };

  getTabs = () => {
    const { widgetsEnabled, customTopicsEnabled } = this.props;
    const { tabs } = this.state;

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

    let enabledTabs: ITab[] = [];

    tabNames.forEach((tabName) => {
      if (tabName && tabHideConditions?.[tabName]?.()) {
        enabledTabs = reject(enabledTabs, { name: tabName });
      }
    });

    return enabledTabs;
  };

  render() {
    const { children } = this.props;
    const { formatMessage } = this.props.intl;

    const resource = {
      title: formatMessage(messages.pageTitle),
    };

    return (
      <>
        <Outlet
          id="app.containers.Admin.settings.SettingsPage"
          onData={this.insertTab}
        />
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
      </>
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
