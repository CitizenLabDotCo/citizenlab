import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
// import { FormattedMessage } from 'react-intl';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/ideas/sagas';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';
import { resetIdeas } from 'resources/ideas/actions';

class IdeaDashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillUnmount() {
    // reset ideas upon page leaving, to avoid double items when going back
    this.props.resetIdeas();
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


IdeaDashboard.propTypes = {
  resetIdeas: PropTypes.func.isRequired,
  children: PropTypes.element,
};

export default preprocess(null, { resetIdeas })(IdeaDashboard);
