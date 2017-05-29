import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';

// components
// import { FormattedMessage } from 'react-intl';
import WatchSagas from 'utils/containers/watchSagas';
import sagas from 'resources/projects/sagas';

// store
import { preprocess } from 'utils';

// messages
import messages from './messages';
import { loadProjectsRequest, resetProjects } from 'resources/projects/actions';

class ProjectDashboard extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.loadProjectsRequest(true);
  }

  componentWillUnmount() {
    // reset projects upon page leaving, to avoid double items when going back
    this.props.resetProjects();
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


ProjectDashboard.propTypes = {
  loadProjectsRequest: PropTypes.func.isRequired,
  resetProjects: PropTypes.func.isRequired,
  children: PropTypes.element,
};

export default preprocess(null, { loadProjectsRequest, resetProjects })(ProjectDashboard);
