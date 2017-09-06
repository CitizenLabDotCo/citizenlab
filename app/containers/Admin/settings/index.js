import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { Saga } from 'react-redux-saga';
import TabbedResource from 'components/admin/TabbedResource';
import { watchSaveSettings } from './sagas';
import messages from './messages';
import { injectIntl, intlShape } from 'react-intl';

class SettingsPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.tabs = [
      { label: this.props.intl.formatMessage(messages.tabSettings), url: '/admin/settings' },
      { label: this.props.intl.formatMessage(messages.tabCustomize), url: '/admin/settings/customize' },
    ];

    this.resource = {
      title: this.props.intl.formatMessage(messages.viewPublicResource),
    };
  }

  render() {
    return (
      <div>
        <TabbedResource
          resource={this.resource}
          messages={messages}
          tabs={this.tabs}
          location={this.props.router.location}
        >
          <HelmetIntl
            title={messages.helmetTitle}
            description={messages.helmetDescription}
          />
          <Saga saga={watchSaveSettings} />

          {this.props.children}
        </TabbedResource>
      </div>
    );
  }
}

SettingsPage.propTypes = {
  children: PropTypes.any,
  intl: intlShape,
  router: PropTypes.any,
};

export default injectIntl(SettingsPage);
