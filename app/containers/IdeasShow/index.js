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
import VoteIdea from 'components/VoteIdea';
import draftToHtml from 'draftjs-to-html';
import styled from 'styled-components';
import { Label, Button } from 'components/Foundation';
import renderHTML from 'react-render-html';

import { watchFetchIdea, watchLoadIdeaVotes, watchVoteIdea, watchFetchComments, watchStoreComment } from './sagas';
import CommentEditorWrapper from './CommentEditorWrapper';
import CommentList from './CommentList';
import messages from './messages';
import IdeaContent from './IdeaContent';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import {
  loadComments, resetPageData, loadIdea, loadIdeaSuccess, loadVotes, voteIdea, publishComment, publishCommentError, saveCommentDraft,
} from './actions';
import makeSelectIdeasShow, {
  makeSelectActiveParentId, makeSelectCommentContent, makeSelectComments, makeSelectLoadCommentsError, makeSelectLoadIdeaError, makeSelectLoadingComments, makeSelectLoadingIdea, makeSelectNextCommentPageItemCount, makeSelectNextCommentPageNumber, makeSelectResetEditorContent, makeSelectStoreCommentError, makeSelectDownVotes, makeSelectIdeaVotesLoadError, makeSelectIdeaVoteSubmitError, makeSelectLoadingVotes, makeSelectSubmittingVote, makeSelectUpVotes, makeSelectSubmittingComment,
} from './selectors';

export class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // bind event handlers to provide 'this' context
    this.goToNextPage = this.goToNextPage.bind(this);
  }

  componentDidMount() {
    const slug = this.props.params.slug;

    if (this.props.showIdeaWithIndexPage === false) {
      this.props.loadIdea(slug);
    }
    this.props.loadComments(slug);
    this.props.loadIdeaVotes(slug);
  }

  componentWillUnmount() {
    this.props.dispatch(setShowIdeaWithIndexPage(false));

    if (this.props.showIdeaWithIndexPage === false) {
      this.props.dispatch(loadIdeaSuccess(null));
    }

    // reset component state
    this.props.resetData();
  }

  goToNextPage() {
    const idea = this.props.idea || this.props.pageData.idea;

    const { loadNextCommentsPage, nextCommentPageNumber, nextCommentPageItemCount } = this.props;
    loadNextCommentsPage(idea.data.id, nextCommentPageNumber, nextCommentPageItemCount);
  }

  notFoundHtml() {
    return (<h2>Idea Not Found :/</h2>);
  }

  ideaHtml(idea) {
    const { attributes, relationships } = idea;
    const authorId = relationships.author && relationships.author.id;

    return (
      <div>
        {attributes.images && attributes.images.length > 0 && <ImageCarousel
          ideaImages={attributes.images}
        />}
        <h2><T value={attributes.title_multiloc} /></h2>
        <p><strong>By: {authorId} </strong></p>
        <IdeaContent>{renderHTML(attributes.body_multiloc.en)}</IdeaContent>
      </div>
    );
  }

  render() {
    const { storeCommentDraftCopy, storeCommentError, submittingComment, comments, resetEditorContent, loadingComments, nextCommentPageNumber, loadingIdea, loadIdeaError, commentContent, locale, activeParentId, publishCommentClick, submitIdeaVote, upVotes, downVotes, ideaVotesLoadError, user, submittingVote, loadingVotes, ideaVoteSubmitError } = this.props;
    const idea = this.props.idea || this.props.pageData.idea;

    const WrapperDiv = (props) => (
      <div
        {...props}
      >
        {!!props.children[0] && props.children}
      </div>
    );

    const CenteredDiv = styled(WrapperDiv)`
      margin: auto;
      width: 20%;
    `;

    return (
      <div>
        <Helmet
          title="IdeasShow"
          meta={[
            { name: 'description', content: 'Description of IdeasShow' },
          ]}
        />
        {/* Sagas */}
        <Saga saga={watchFetchIdea} />
        <Saga saga={watchLoadIdeaVotes} />
        <Saga saga={watchVoteIdea} />
        <Saga saga={watchFetchComments} />
        <Saga saga={watchStoreComment} />

        {/* Idea */}
        {loadIdeaError && <div>
          {loadIdeaError}
        </div>}
        {loadingIdea && <FormattedMessage {...messages.loadingIdea} />}
        { idea ? this.ideaHtml(idea) : this.notFoundHtml() }

        {/* Voting */}
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

        <hr />
        { /* comments */ }
        <CommentEditorWrapper
          storeCommentCopy={storeCommentDraftCopy}
          submittingComment={submittingComment}
          resetEditorContent={resetEditorContent}
          idea={idea}
          commentContent={commentContent}
          userId={user && user.id}
          locale={locale}
          parentId={activeParentId}
          publishCommentClick={publishCommentClick}
        />
        <CommentList
          comments={comments}
          storeCommentDraftCopy={storeCommentDraftCopy}
          storeCommentError={storeCommentError}
          submittingComment={submittingComment}
          resetEditorContent={resetEditorContent}
          idea={idea}
          commentContent={commentContent}
          userId={user && user.id}
          locale={locale}
          parentId={activeParentId}
          publishCommentClick={publishCommentClick}
        />
        <CenteredDiv onClick={this.goToNextPage}>
          {(nextCommentPageNumber && !(loadingIdea || loadingComments)) && <Button>
            <FormattedMessage
              {...messages.loadMoreComments}
            />
          </Button>}
          {loadingComments && <Label>
            <FormattedMessage
              {...messages.loadingComments}
            /></Label>}
        </CenteredDiv>
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
  storeCommentDraftCopy: PropTypes.func.isRequired,
  storeCommentError: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
  commentContent: PropTypes.string,
  comments: PropTypes.any.isRequired,
  locale: PropTypes.string.isRequired,
  loadIdea: PropTypes.func.isRequired,
  loadComments: PropTypes.func.isRequired,
  loadNextCommentsPage: PropTypes.func.isRequired,
  nextCommentPageNumber: PropTypes.number,
  nextCommentPageItemCount: PropTypes.number,
  loadingComments: PropTypes.bool.isRequired,
  loadingIdea: PropTypes.bool.isRequired,
  loadIdeaError: PropTypes.string,
  activeParentId: PropTypes.string,
  publishCommentClick: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired,
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
  loadingIdea: makeSelectLoadingIdea(),
  loadingComments: makeSelectLoadingComments(),
  loadCommentsError: makeSelectLoadCommentsError(),
  loadIdeaError: makeSelectLoadIdeaError(),
  comments: makeSelectComments(),
  storeCommentError: makeSelectStoreCommentError(),
  submittingComment: makeSelectSubmittingComment(),
  commentContent: makeSelectCommentContent(),
  locale: makeSelectLocale(),
  resetEditorContent: makeSelectResetEditorContent(),
  nextCommentPageNumber: makeSelectNextCommentPageNumber(),
  nextCommentPageItemCount: makeSelectNextCommentPageItemCount(),
  activeParentId: makeSelectActiveParentId(),
});

export function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    loadIdeaVotes(ideaId) {
      dispatch(loadVotes(ideaId));
    },
    submitIdeaVote(ideaId, mode) {
      dispatch(voteIdea(ideaId, mode));
    },
    loadIdea(ideaId) {
      dispatch(loadIdea(ideaId));
    },
    loadComments(ideaId) {
      dispatch(loadComments(ideaId, null, null, true));
    },
    loadNextCommentsPage(ideaId, nextCommentPageNumber, nextCommentPageItemCount) {
      dispatch(loadComments(ideaId, nextCommentPageNumber, nextCommentPageItemCount, false));
    },
    storeCommentDraftCopy(content, activeParentId) {
      // convert to HTML
      const htmlContent = draftToHtml(content);

      dispatch(saveCommentDraft(htmlContent, activeParentId));
    },
    publishCommentClick(ideaId, htmlContent, userId, locale, parentId, commentId) {
      if (htmlContent && htmlContent.trim() !== '<p></p>') {
        const htmlContents = {};
        htmlContents[locale] = htmlContent;
        dispatch(publishComment(ideaId, userId, htmlContents, parentId));
      } else {
        // empty comment error
        dispatch(publishCommentError('', commentId));
      }
    },
    resetData() {
      dispatch(resetPageData());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasShow);
