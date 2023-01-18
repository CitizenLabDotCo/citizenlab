import React from 'react';

// router
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import { ITab } from 'typings';

export interface InputProps {}

export interface Props extends InputProps {}

interface State {
  tabs: ITab[];
}

class SettingsPage extends React.PureComponent<
  Props & WrappedComponentProps & WithRouterProps,
  State
> {
  constructor(props: Props & WrappedComponentProps & WithRouterProps) {
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
          label: formatMessage(messages.tabTopics),
          name: 'topics',
          url: '/admin/settings/topics',
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

  render() {
    const { formatMessage } = this.props.intl;

    const resource = {
      title: formatMessage(messages.pageTitle),
    };

    return (
      <TabbedResource resource={resource} tabs={this.state.tabs}>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <div id="e2e-settings-container">
          <RouterOutlet />
        </div>
      </TabbedResource>
    );
  }
}

export default withRouter(injectIntl(SettingsPage));
