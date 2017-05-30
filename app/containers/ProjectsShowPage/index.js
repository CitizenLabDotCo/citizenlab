/*
 *
 * ProjectView
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
// import Show from './components/show';
// import LoadMessages from './components/loadMessages';
import WatchSagas from 'containers/WatchSagas';
import HelmetIntl from 'components/HelmetIntl';

// store
import { preprocess } from 'utils';
import { push } from 'react-router-redux';
import sagasWatchers from './sagas';
import { loadProjectRequest } from './actions';

import messages from './messages';

class ProjectView extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();
    const { params } = props;
    this.id = params.slug;
  }

  componentDidMount() {
    this.props.loadProjectRequest(this.id);
  }

  render() {
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <WatchSagas sagas={sagasWatchers} />
        <ul>
          <li>
            <a onClick={() => this.props.push(`/projects/${this.id}/ideas`)}> Ideas </a>
          </li>
          <li>
            <a onClick={() => this.props.push(`/projects/${this.id}/info`)}> Info </a>
          </li>
        </ul>
        {this.props.children && React.cloneElement(this.props.children, { projectId: this.id })}
      </div>
    );
  }
}

ProjectView.propTypes = {
  params: PropTypes.object.isRequired,
  loadProjectRequest: PropTypes.func.isRequired,
  children: PropTypes.any,
  push: PropTypes.func.isRequired,
};

export default preprocess(null, { loadProjectRequest, push })(ProjectView);
