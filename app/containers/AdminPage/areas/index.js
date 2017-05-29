import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

// components
// import { FormattedMessage } from 'react-intl';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/areas/sagas';

// store
import { preprocess } from 'utils';

// messages
// import messages from './messages';
import { loadAreasRequest, resetAreas } from 'resources/areas/actions';

class AreaDashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.loadAreasRequest(true);
  }

  componentWillUnmount() {
    // reset areas upon page leaving, to avoid double items when going back
    this.props.resetAreas();
  }

  render() {
    return (
      <div>
        <Helmet
          title="AreaDashboard"
          meta={[
            { name: 'description', content: 'Description of AreaDashboard' },
          ]}
        />
        <WatchSagas sagas={sagas} />
        {this.props.children}
      </div>

    );
  }
}


AreaDashboard.propTypes = {
  loadAreasRequest: PropTypes.func.isRequired,
  resetAreas: PropTypes.func.isRequired,
  children: PropTypes.element,
};

export default preprocess(null, { loadAreasRequest, resetAreas })(AreaDashboard);
