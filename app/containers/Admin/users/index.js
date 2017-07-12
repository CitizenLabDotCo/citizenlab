import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
// import { FormattedMessage } from 'react-intl';
// import WatchSagas from 'utils/containers/watchSagas';
// import sagas from 'resources/users/sagas';

// store
// import { preprocess } from 'utils';

// messages
import messages from './messages';

class UserDashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

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


UserDashboard.propTypes = {
  children: PropTypes.element,
};

export default UserDashboard;
