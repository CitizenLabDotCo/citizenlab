// Libraries
import React from 'react';

// Components
import HelmetIntl from 'components/HelmetIntl';

// i18n
import messages from './messages';

export default class GroupsDashboard extends React.PureComponent {
  render() {
    return (
      <div id="e2e-groups-admin-dashboard">
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {this.props.children}
      </div>
    );
  }
}
