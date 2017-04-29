/**
*
* CommentList
*
*/

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { Comment } from 'semantic-ui-react';

import makeSelectIdeasShow, { makeSelectComments } from 'containers/IdeasShow/selectors';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

// import Comment from './comments/show';

// import CommentEditorWrapper from './CommentEditorWrapper';
import T from 'containers/T';


// function CommentGroup(props) {
//   const { className, commentContent, createdAt, modifiedAt } = props;

//   return (
//     <div className={className}>
//         <T value={commentContent} />
//       ... created at: {createdAt}
//       ... modified at: {modifiedAt}
//       {this.props.children}
//     </div>
//   );
// }

// Comment.propTypes = {
//   className: PropTypes.string,
//   commentContent: PropTypes.object.isRequired,
//   createdAt: PropTypes.any,
//   modifiedAt: PropTypes.any,
// };
/*
<Comment.Group>
  <Comment>
    <Comment.Avatar as='a' src='/assets/images/avatar/small/jenny.jpg' />
    <Comment.Content>
      <Comment.Author as='a'>Jenny Hess</Comment.Author>
      <Comment.Metadata>
        <span>Just now</span>
      </Comment.Metadata>
      <Comment.Text>Elliot you are always so right :)</Comment.Text>
      <Comment.Actions>
        <a>Reply</a>
      </Comment.Actions>
    </Comment.Content>
  </Comment>
</Comment.Group>
*/


class CommentShow extends React.Component {
  render() {
    const { comment } = this.props;
    // const id = comment.get('id');
    const attributes = comment.get('attributes');
    const content = attributes.get('body_multiloc').toJS();
    const children = comment.getIn(['relationships', 'children', 'data']);
    return (
      <Comment>
        <Comment.Content>
          <Comment.Author as={'a'}>WE NEED TO GET HE AUTHORS NAME</Comment.Author>
          <Comment.Metadata>
            <span>Just now</span>
          </Comment.Metadata>
          <Comment.Text>
            <T value={content} />
          </Comment.Text>
          <Comment.Actions>
            <a> NEED TO ADD REPPLY </a>
          </Comment.Actions>
        </Comment.Content>
        <CommentsShow comments={children} />
      </Comment>
    );
  }
}

CommentShow.propTypes = {
  comment: React.PropTypes.any,
//  publishCommentClick: React.PropTypes.func,
};

class CommentsShow extends React.Component {
  render() {
    const { comments } = this.props;
    if (!comments) return null;
    const commentsArray = comments.toArray();
    return (
      <Comment.Group>
        {commentsArray.map(((comment) => <CommentShow key={comment.get('id')} comment={comment} />))}
      </Comment.Group>
    );
  }
}

CommentsShow.propTypes = {
  comments: React.PropTypes.any,
//  publishCommentClick: React.PropTypes.func,
};


/*  <span>
  {props.comments.map((comment) => {
    const id = comment.get('id');
    const attributes = comment.get('attributes');
    return <div key={comment.get('id')}>
      <Comment
        commentContent={attributes.body_multiloc}
        createdAt={attributes.created_at}
        modifiedAt={attributes.modified_at}
        storeCommentDraftCopy={props.storeCommentDraftCopy}
        storeCommentError={props.storeCommentError}
        submittingComment={props.submittingComment}
        resetEditorContent={props.resetEditorContent}
      />
    </div>
  })}
  </span>);

      props.idea && props.userId && <CommentEditorWrapper
          storeCommentError={props.storeCommentError}
          submittingComment={props.submittingComment}
          resetEditorContent={props.resetEditorContent}
          idea={props.idea}
          userId={props.userId}
          locale={props.locale}
          parentId={comment.id}
          publishCommentClick={props.publishCommentClick}
        />*/

class CommentContainer extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { comments, className, storeCommentError, submittingComment, resetEditorContent, idea, userId, locale, parentId, publishCommentClick } = this.props;
    if (!comments) return null;
    return (
      <div className={className}>
        {storeCommentError && storeCommentError !== '' && <div>
          {storeCommentError}
        </div>}
        <Comment.Group minimal>
          <CommentsShow
            comments={comments}
            storeCommentError={storeCommentError}
            submittingComment={submittingComment}
            resetEditorContent={resetEditorContent}
            idea={idea}
            userId={userId}
            locale={locale}
            parentId={parentId}
            publishCommentClick={publishCommentClick}
          />
        </Comment.Group>
      </div>
    );
  }
}

CommentContainer.propTypes = {
  comments: PropTypes.any,
  className: PropTypes.string,
  storeCommentError: PropTypes.string,
  submittingComment: PropTypes.bool.isRequired,
  resetEditorContent: PropTypes.bool.isRequired,
  parentId: PropTypes.string,
  idea: PropTypes.any,
  userId: PropTypes.string,
  locale: PropTypes.string.isRequired,
  publishCommentClick: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  comments: makeSelectComments(),
  storeCommentError: makeSelectIdeasShow('storeCommentError'),
  submittingComment: makeSelectIdeasShow('submittingComment'),
  resetEditorContent: makeSelectIdeasShow('resetEditorContent'),
  locale: makeSelectLocale(),
});

export default connect(mapStateToProps)(CommentContainer);
