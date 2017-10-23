import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import TabbedResource from 'components/admin/TabbedResource';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

interface ITab {
  label: string;
  url: string;
}

interface IResources {
  title: string;
}

type Props = {};

type State = {};

class SettingsPage extends React.PureComponent<Props & InjectedIntlProps, State> {
  tabs: ITab[];
  resources: IResources;

  componentWillMount() {
    const { formatMessage } = this.props.intl;

    this.tabs = [
      { label: formatMessage(messages.tabSettings), url: '/admin/settings' },
      { label: formatMessage(messages.tabCustomize), url: '/admin/settings/customize' },
    ];

    this.resources = {
      title: formatMessage(messages.viewPublicResource)
    };
  }

  render() {
    const location = browserHistory.getCurrentLocation();

    return (
      <div>
        <TabbedResource
          resource={this.resources}
          messages={messages}
          tabs={this.tabs}
          location={location}
        >
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />

          {/* <Saga saga={watchSaveSettings} /> */}

          {this.props.children}
        </TabbedResource>
      </div>
    );
  }
}

export default injectIntl<Props>(SettingsPage);
