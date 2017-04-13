/*
 *
 * IdeasShow
 *
 */

import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import T from 'containers/T';
import { connect } from 'react-redux';
import ImageCarousel from 'components/ImageCarousel';
import { setShowIdeaWithIndexPage } from 'containers/IdeasIndexPage/actions';
import { createStructuredSelector } from 'reselect';
import draftToHtml from 'draftjs-to-html';
import { Saga } from 'react-redux-saga';
import { FormattedMessage } from 'react-intl';

import {
  loadComments,
  loadIdea,
  loadIdeaSuccess, publishComment, publishCommentError, saveCommentDraft,
} from './actions';
import makeSelectIdeasShow, {
  makeSelectCommentContent, makeSelectComments, makeSelectLoadCommentsError, makeSelectLoadingComments, makeSelectStoreCommentError, makeSelectSubmittingComment,
} from './selectors';
import CommentEditorWrapper from './CommentEditorWrapper';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import { watchFetchComments, watchFetchIdea, watchStoreComment } from './sagas';
import CommentList from './CommentList';
import messages from './messages';

export class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // bind event handlers
    this.publishComment = this.publishComment.bind(this);
  }

  componentDidMount() {
    if (this.props.showIdeaWithIndexPage === false) {
      const slug = this.props.params.slug;
      this.props.loadIdea(slug);
      this.props.loadComments(slug);
    }
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

  publishComment() {
    const { commentContent, user, locale } = this.props;
    const idea = this.props.idea || this.props.pageData.idea;

    // TODO: replace this with actual id by passing from right component
    const parentId = null;

    this.props.publishCommentClick(idea.id, commentContent, user && user.id, locale, parentId);
  }

  render() {
    const idea = this.props.idea || this.props.pageData.idea;
    const { storeCommentDraftCopy, storeCommentError, submittingComment, comments } = this.props;

    return (
      <div>
        <Helmet
          title="IdeasShow"
          meta={[
            { name: 'description', content: 'Description of IdeasShow' },
          ]}
        />
        <Saga saga={watchFetchIdea} />
        <Saga saga={watchFetchComments} />
        <Saga saga={watchStoreComment} />

        { idea ? this.ideaHtml(idea) : this.notFoundHtml() }
        <hr />
        <CommentEditorWrapper
          storeCommentCopy={storeCommentDraftCopy}
          storeCommentError={storeCommentError}
          submittingComment={submittingComment}
        />
        <button onClick={this.publishComment}>
          <FormattedMessage {...messages.publishComment} />
        </button>
        <CommentList
          comments={comments}
        />
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
  storeCommentDraftCopy: PropTypes.func.isRequired,
  storeCommentError: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  commentContent: PropTypes.string,
  user: PropTypes.object,
  comments: PropTypes.any.isRequired,
  locale: PropTypes.string.isRequired,
  loadIdea: PropTypes.func.isRequired,
  loadComments: PropTypes.func.isRequired,
  publishCommentClick: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageData: makeSelectIdeasShow(),
  loadingComments: makeSelectLoadingComments(),
  loadCommentsError: makeSelectLoadCommentsError(),
  comments: makeSelectComments(),
  storeCommentError: makeSelectStoreCommentError(),
  submittingComment: makeSelectSubmittingComment(),
  commentContent: makeSelectCommentContent(),
  locale: makeSelectLocale(),
  user: makeSelectCurrentUser(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    loadIdea(ideaId) {
      dispatch(loadIdea(ideaId));
    },
    loadComments(ideaId) {
      dispatch(loadComments(ideaId));
    },
    storeCommentDraftCopy(content) {
      // convert to HTML
      const htmlContent = draftToHtml(content);

      dispatch(saveCommentDraft(htmlContent));
    },
    publishCommentClick(ideaId, content, userId, locale, parentId) {
      if (content && content.trim() !== '<p></p>') {
        const htmlContents = {};
        htmlContents[locale] = content;
        dispatch(publishComment(ideaId, userId, htmlContents, parentId));
      } else {
        // empty comment error
        dispatch(publishCommentError(''));
      }
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasShow);
