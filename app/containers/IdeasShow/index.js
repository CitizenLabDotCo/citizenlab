/*
 *
 * IdeasShow
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';

import { watchFetchIdea, watchLoadIdeaVotes, watchVoteIdea, watchFetchComments, watchStoreComment } from './sagas';
import messages from './messages';

import { loadComments, loadVotes, loadIdea } from './actions';

import makeSelectIdeasShow from './selectors';

import Show from './components/show';

class xLoadIdeaError extends React.Component {
  render() {
    const { loadIdeaError } = this.props;
    if (!loadIdeaError) return null;
    return <div>{loadIdeaError}</div>;
  }
}

xLoadIdeaError.propTypes = {
  loadIdeaError: PropTypes.string,
};

const LoadIdeaErrorMDP = createStructuredSelector({
  loadIdeaError: makeSelectIdeasShow('loadIdeaError'),
});

const LoadIdeaError = connect(LoadIdeaErrorMDP)(xLoadIdeaError);

class xLoadingIdeaMessage extends React.Component {
  render() {
    const { loadingIdea } = this.props;
    if (!loadingIdea) return null;
    return <FormattedMessage {...messages.loadingIdea} />;
  }
}

xLoadingIdeaMessage.propTypes = {
  loadingIdea: PropTypes.bool.isRequired,
};

const LoadingIdeaMessageMDP = createStructuredSelector({
  loadingIdea: makeSelectIdeasShow('loadingIdea'),
});

const LoadingIdeaMessage = connect(LoadingIdeaMessageMDP)(xLoadingIdeaMessage);

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();
    this.runningSagas = [];
    this.id = props.params.slug;
  }

  componentWillMount() {
    if (this.context.sagas) {
      [watchFetchIdea, watchLoadIdeaVotes, watchVoteIdea, watchFetchComments, watchStoreComment].map((saga) => {
        const runSaga = this.context.sagas.run(saga, this.props);
        return this.runningSagas.push(runSaga);
      });
      this.props.loadIdea(this.id);
      this.props.loadComments(this.id);
      this.props.loadVotes(this.id);
    }
  }

  componentWillUnmount() {
    this.runningSagas.map((saga) => saga.cancel());
    delete this.runningSagas;
  }

  render() {
    return (
      <div>
        <LoadIdeaError />
        <LoadingIdeaMessage />
        <Show />
      </div>
    );
  }
}

IdeasShow.contextTypes = {
  sagas: React.PropTypes.func.isRequired,
};

IdeasShow.propTypes = {
  loadComments: React.PropTypes.func.isRequired,
  loadVotes: React.PropTypes.func.isRequired,
  params: React.PropTypes.func.object,
  loadIdea: React.PropTypes.func,
};

const ideasShowActions = { loadIdea, loadComments, loadVotes };
const mapDispatchToProps = (dispatch) => bindActionCreators(ideasShowActions, dispatch);


export default connect(null, mapDispatchToProps)(IdeasShow);
