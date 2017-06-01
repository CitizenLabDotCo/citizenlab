import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
// import { FormattedMessage } from 'react-intl';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/pages/sagas';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';
import { resetPages } from 'resources/pages/actions';

class PageDashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillUnmount() {
    // reset pages upon page leaving, to avoid double items when going back
    this.props.resetPages();
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


PageDashboard.propTypes = {
  resetPages: PropTypes.func.isRequired,
  children: PropTypes.element,
};

export default preprocess(null, { resetPages })(PageDashboard);
