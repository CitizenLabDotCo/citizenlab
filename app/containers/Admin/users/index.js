import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
// import { FormattedMessage } from 'react-intl';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/users/sagas';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';
import { resetUsers } from 'resources/users/actions';

class UserDashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillUnmount() {
    // reset users upon user leaving, to avoid double items when going back
    this.props.resetUsers();
  }

  render() {
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagas} />
        {this.props.children}
      </div>

    );
  }
}


UserDashboard.propTypes = {
  resetUsers: PropTypes.func.isRequired,
  children: PropTypes.element,
};

export default preprocess(null, { resetUsers })(UserDashboard);
