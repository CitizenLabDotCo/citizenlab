// /**
// *
// * CommentList
// *
// */

// import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';
// import Comment from './Comment';
// import CommentEditorWrapper from './CommentEditorWrapper';

// import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';



// export const Comments = (props) => (<span>
//   {props.comments.map((comment) =>
//     (<div key={comment.id}>
//       <Comment
//         commentContent={comment.attributes.body_multiloc}
//         parentId={comment.relationships.parent.data && comment.relationships.parent.data.id}
//         createdAt={comment.attributes.created_at}
//         modifiedAt={comment.attributes.modified_at}
//         storeCommentDraftCopy={props.storeCommentDraftCopy}
//         storeCommentError={props.storeCommentError}
//         submittingComment={props.submittingComment}
//         resetEditorContent={props.resetEditorContent}
//       />
//       {props.idea && props.userId && <CommentEditorWrapper
//         storeCommentError={props.storeCommentError}
//         submittingComment={props.submittingComment}
//         resetEditorContent={props.resetEditorContent}
//         idea={props.idea}
//         userId={props.userId}
//         locale={props.locale}
//         parentId={comment.id}
//         publishCommentClick={props.publishCommentClick}
//       />}
//     </div>)
//   )}
// </span>);

// class CommentList extends React.Component { // eslint-disable-line react/prefer-stateless-function
//   render() {
//     const { comments, className, storeCommentError, submittingComment, resetEditorContent, idea, userId, locale, parentId, publishCommentClick } = this.props;

//     return (
//       <div className={className}>
//         {storeCommentError && storeCommentError !== '' && <div>
//           {storeCommentError}
//         </div>}
//         <Comments
//           comments={comments}
//           storeCommentError={storeCommentError}
//           submittingComment={submittingComment}
//           resetEditorContent={resetEditorContent}
//           idea={idea}
//           userId={userId}
//           locale={locale}
//           parentId={parentId}
//           publishCommentClick={publishCommentClick}
//         />
//       </div>
//     );
//   }
// }

// CommentList.propTypes = {
//   comments: PropTypes.any.isRequired,
//   className: PropTypes.string,
//   storeCommentError: PropTypes.string,
//   submittingComment: PropTypes.bool.isRequired,
//   resetEditorContent: PropTypes.bool.isRequired,
//   parentId: PropTypes.string,
//   idea: PropTypes.any,
//   userId: PropTypes.string,
//   locale: PropTypes.string.isRequired,
//   publishCommentClick: PropTypes.func.isRequired,
// };

// Comments.propTypes = {
//   comments: PropTypes.any.isRequired,
//   publishCommentClick: PropTypes.func.isRequired,
// };



// const mapStateToProps = createStructuredSelector({
//   upVotes: makeSelectUpVotes(),
//   downVotes: makeSelectDownVotes(),
//   ideaVotesLoadError: makeSelectIdeaVotesLoadError(),
//   user: makeSelectCurrentUser(),
//   loadingVotes: makeSelectLoadingVotes(),
//   submittingVote: makeSelectSubmittingVote(),
//   ideaVoteSubmitError: makeSelectIdeaVoteSubmitError(),
//   loadingIdea: makeSelectLoadingIdea(),
//   loadingComments: makeSelectLoadingComments(),
//   loadCommentsError: makeSelectLoadCommentsError(),
//   loadIdeaError: makeSelectLoadIdeaError(),
//   // comments: makeSelectComments(),
//   // storeCommentError: makeSelectStoreCommentError(),
//   // submittingComment: makeSelectSubmittingComment(),
//   commentContent: makeSelectCommentContent(),
//   locale: makeSelectLocale(),
//   // resetEditorContent: makeSelectResetEditorContent(),
//   nextCommentPageNumber: makeSelectNextCommentPageNumber(),
//   nextCommentPageItemCount: makeSelectNextCommentPageItemCount(),
//   activeParentId: makeSelectActiveParentId(),
//   //idea: makeSelectIdea(),
// });