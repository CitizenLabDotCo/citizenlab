import React from 'react';

// router
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

import { InsertConfigurationOptions, ITab } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';
import Outlet from 'components/Outlet';

import Breadcrumbs from 'components/UI/Breadcrumbs';

export interface InputProps {}

export interface Props extends InputProps {}

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
          name: 'pages',
          label: formatMessage(messages.tabPages),
          url: '/admin/settings/pages',
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

    const testBreadcrumbs = [
      { label: 'First Breadcrumb', linkTo: '/admin/settings/general' },
      { label: 'Second Breadcrumb', linkTo: '/admin/settings/general' },
      // { label: 'Third Breadcrumb', linkTo: '/admin/settings/general' },
      // { label: 'Last Breadcrumb' },
    ];

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
            <Breadcrumbs breadcrumbs={testBreadcrumbs} />
            {/* <RouterOutlet /> */}
          </div>
        </TabbedResource>
      </>
    );
  }
}

export default withRouter(injectIntl(SettingsPage));
