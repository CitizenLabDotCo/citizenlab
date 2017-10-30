import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

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
