/*
 *
 * IdeasShow
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import Show from './components/show';
import LoadMessages from './components/loadMessages';

// store
import { preprocess } from 'utils';
import WatchSagas from 'containers/WatchSagas';
import sagasWatchers from './sagas';
import { loadCommentsRequest, loadVotesRequest, loadIdeaRequest, resetPageData } from './actions';

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();
    const { params } = props;

    if (params && params.ideaId) {
      this.id = params.ideaId;
    } else {
      this.id = props.id;
    }
  }

  componentDidMount() {
    this.props.loadIdeaRequest(this.id);
    this.props.loadCommentsRequest(this.id);
    this.props.loadVotesRequest(this.id);
  }

  componentWillUnmount() {
    this.props.resetPageData();
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <LoadMessages />
        <Show location={location} id={this.id} />
      </div>
    );
  }
}

IdeasShow.propTypes = {
  loadIdeaRequest: PropTypes.func.isRequired,
  loadVotesRequest: PropTypes.func.isRequired,
  loadCommentsRequest: PropTypes.func,
  params: PropTypes.object,
  resetPageData: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  id: PropTypes.string,
};

export default preprocess(null, { loadIdeaRequest, loadCommentsRequest, loadVotesRequest, resetPageData })(IdeasShow);
