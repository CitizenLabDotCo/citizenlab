import * as React from 'react';
// components
import HelmetIntl from 'components/HelmetIntl';

// messages
import messages from './messages';

export default class UserDashboard extends React.PureComponent {
  render() {
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        {this.props.children}
      </div>
    );
  }
}
