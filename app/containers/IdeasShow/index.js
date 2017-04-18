/*
 *
 * IdeasShow
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import T from 'containers/T';
import { connect } from 'react-redux';
import ImageCarousel from 'components/ImageCarousel';
import { setShowIdeaWithIndexPage } from 'containers/IdeasIndexPage/actions';
import { createStructuredSelector } from 'reselect';
import { Saga } from 'react-redux-saga';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

import {
  loadIdea, loadIdeaSuccess, loadVotes, voteIdea,
} from './actions';
import makeSelectIdeasShow, {
  makeSelectDownVotes, makeSelectIdeaVotesLoadError, makeSelectIdeaVoteSubmitError, makeSelectLoadingVotes,
  makeSelectSubmittingVote, makeSelectUpVotes,
} from './selectors';
import VoteIdea from '../../components/VoteIdea/index';
import { watchFetchIdea, watchLoadIdeaVotes, watchVoteIdea } from './sagas';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';

export class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    const slug = this.props.params.slug;

    if (this.props.showIdeaWithIndexPage === false) {
      this.props.dispatch(loadIdea(slug));
    }
    this.props.loadIdeaVotes(slug);
  }

  componentWillUnmount() {
    this.props.dispatch(setShowIdeaWithIndexPage(false));

    if (this.props.showIdeaWithIndexPage === false) {
      this.props.dispatch(loadIdeaSuccess(null));
    }
  }

  notFoundHtml() {
    return (<h2>Idea Not Found :/</h2>);
  }

  ideaHtml(idea) {
    const { attributes } = idea;

    return (
      <div>
        {attributes.images && attributes.images.length > 0 && <ImageCarousel
          ideaImages={attributes.images}
        />}
        <h2><T value={attributes.title_multiloc} /></h2>
        <p><strong>Some Author</strong></p>
        <div dangerouslySetInnerHTML={{ __html: attributes.body_multiloc.en }}></div>
      </div>
    );
  }

  render() {
    const idea = this.props.idea || this.props.pageData.idea;
    const { submitIdeaVote, upVotes, downVotes, ideaVotesLoadError, user, submittingVote, loadingVotes, ideaVoteSubmitError } = this.props;
    return (
      <div>
        <Helmet
          title="IdeasShow"
          meta={[
            { name: 'description', content: 'Description of IdeasShow' },
          ]}
        />
        <Saga saga={watchFetchIdea} />
        <Saga saga={watchLoadIdeaVotes} />
        <Saga saga={watchVoteIdea} />

        { idea ? this.ideaHtml(idea) : this.notFoundHtml() }
        {ideaVotesLoadError && <FormattedMessage {...messages.loadVotesError} />}
        {idea && !(ideaVotesLoadError || loadingVotes) && <VoteIdea
          ideaId={idea.id}
          userId={user && user.id}
          upVotes={upVotes}
          downVotes={downVotes}
          onVoteIdeaClick={submitIdeaVote}
          submittingVote={submittingVote}
          ideaVoteSubmitError={ideaVoteSubmitError}
        />}
      </div>
    );
  }
}

IdeasShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  idea: PropTypes.object,
  pageData: PropTypes.object,
  showIdeaWithIndexPage: PropTypes.bool,
  params: PropTypes.object,
  submitIdeaVote: PropTypes.func.isRequired,
  loadIdeaVotes: PropTypes.func.isRequired,
  upVotes: PropTypes.any.isRequired,
  downVotes: PropTypes.any.isRequired,
  ideaVotesLoadError: PropTypes.string,
  user: PropTypes.any,
  loadingVotes: PropTypes.bool.isRequired,
  submittingVote: PropTypes.bool.isRequired,
  ideaVoteSubmitError: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  pageData: makeSelectIdeasShow(),
  upVotes: makeSelectUpVotes(),
  downVotes: makeSelectDownVotes(),
  ideaVotesLoadError: makeSelectIdeaVotesLoadError(),
  user: makeSelectCurrentUser(),
  loadingVotes: makeSelectLoadingVotes(),
  submittingVote: makeSelectSubmittingVote(),
  ideaVoteSubmitError: makeSelectIdeaVoteSubmitError(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    loadIdeaVotes(ideaId) {
      dispatch(loadVotes(ideaId));
    },
    submitIdeaVote(ideaId, userId, op) {
      dispatch(voteIdea(ideaId, userId, op));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasShow);
