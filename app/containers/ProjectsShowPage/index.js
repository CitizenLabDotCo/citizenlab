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
import Helmet from 'react-helmet';

// store
import { preprocess } from 'utils';
import { push } from 'react-router-redux';
import sagasWatchers from './sagas';
import { loadProjectRequest } from './actions';

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
        <Helmet
          title="ProjectShowPage"
          meta={[
            { name: 'description', content: 'Description of ProjectShowPage' },
          ]}
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
