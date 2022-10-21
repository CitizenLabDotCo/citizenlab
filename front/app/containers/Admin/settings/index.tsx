import React from 'react';

// router
import { Outlet as RouterOutlet } from 'react-router-dom';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import TabbedResource from 'components/admin/TabbedResource';
import HelmetIntl from 'components/HelmetIntl';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

import Outlet from 'components/Outlet';
import { InsertConfigurationOptions, ITab } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';

export interface InputProps {}

export interface Props extends InputProps {}

interface State {
  tabs: ITab[];
}

class SettingsPage extends React.PureComponent<
  Props & WrappedComponentProps & WithRouterProps,
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
          name: 'registration',
          label: formatMessage(messages.tabRegistration),
          url: '/admin/settings/registration',
        },
        {
          name: 'areas',
          label: formatMessage(messages.tabAreas),
          url: '/admin/settings/areas',
        },
        {
          name: 'policies',
          label: formatMessage(messages.tabPolicies),
          url: '/admin/settings/policies',
        },
      ],
    };
  }

  handleData = (insertTabOptions: InsertConfigurationOptions<ITab>) => {
    this.setState(({ tabs }) => ({
      tabs: insertConfiguration(insertTabOptions)(tabs),
    }));
  };

  render() {
    const { formatMessage } = this.props.intl;

    const resource = {
      title: formatMessage(messages.pageTitle),
    };

    return (
      <>
        <Outlet
          id="app.containers.Admin.settings.tabs"
          onData={this.handleData}
        />
        <TabbedResource resource={resource} tabs={this.state.tabs}>
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          <div id="e2e-settings-container">
            <RouterOutlet />
          </div>
        </TabbedResource>
      </>
    );
  }
}

export default withRouter(injectIntl(SettingsPage));
