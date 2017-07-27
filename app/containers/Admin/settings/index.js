import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { Saga } from 'react-redux-saga';
import TabbedResource from 'components/admin/TabbedResource';
import { watchSaveSettings } from './sagas';
import messages from './messages';


class SettingsPage extends React.Component { // eslint-disable-line react/prefer-stateless-function

  render() {
    const tabs = [
      { label: 'General', url: '/admin/settings', active: true },
      { label: 'Customize', url: '/admin/settings/customize', active: false },
    ];

    return (
      <div>
        <TabbedResource
          resource={{ title: 'Settings', publicLink: '/admin/settings' }}
          messages={messages}
          tabs={tabs}
        />
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Saga saga={watchSaveSettings} />

        {this.props.children}
      </div>
    );
  }
}

SettingsPage.propTypes = {
  children: PropTypes.any,
};

export default SettingsPage;
