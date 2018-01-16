import * as React from 'react';

// typings
import { Multiloc } from 'typings';

// router
import { withRouter, RouterState } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';

type Props = {};

type State = {};

class SettingsPage extends React.PureComponent<Props & InjectedIntlProps & RouterState, State> {
  state: State;
  tabs: { label: string, url: string }[];
  resource: { title: string | Multiloc };

  componentWillMount() {
    const { formatMessage } = this.props.intl;

    this.tabs = [
      { label: formatMessage(messages.tabSettings), url: '/admin/settings' },
      { label: formatMessage(messages.tabCustomize), url: '/admin/settings/customize' },
      { label: formatMessage(messages.tabPages), url: '/admin/settings/pages' },
    ];

    this.resource = {
      title: formatMessage(messages.viewPublicResource)
    };
  }

  render() {
    return (
      <div>
        <TabbedResource
          resource={this.resource}
          messages={messages}
          tabs={this.tabs}
          location={this.props.location}
        >
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          {this.props.children}
        </TabbedResource>
      </div>
    );
  }
}

export default withRouter(injectIntl<Props>(SettingsPage) as any);
