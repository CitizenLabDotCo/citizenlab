import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import Author from './Author';
import CommentBody from './CommentBody';

// services
import { commentStream, IComment, updateComment } from 'services/comments';
import { userByIdStream, IUser } from 'services/users';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import CommentsMoreActions from './CommentsMoreActions';
import { API } from 'typings';

const StyledMoreActionsMenu: any = styled(CommentsMoreActions)`
  position: absolute;
  top: 10px;
  right: 20px;
  opacity: 0;
  transition: opacity 100ms ease-out;

  ${media.smallerThanMaxTablet`
    opacity: 1;
  `}
`;

const CommentContainer = styled.div`
  padding-top: 30px;
  padding-bottom: 30px;
  padding-left: 30px;
  padding-right: 30px;
  border-top: solid 1px #ddd;
  position: relative;
  /* background: #fff; */

  &:hover {
    ${StyledMoreActionsMenu} {
      opacity: 1;
    }
  }
`;

const StyledAuthor = styled(Author)`
  margin-bottom: 20px;
`;

type Props = {
  commentId: string;
};

type State = {
  comment: IComment | null;
  author: IUser | null;
  spamModalVisible: boolean;
  editionMode: boolean;
};

export default class ChildComment extends React.PureComponent<Props, State> {

  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      comment: null,
      author: null,
      spamModalVisible: false,
      editionMode: false,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { commentId } = this.props;
    const comment$ = commentStream(commentId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        comment$
      ).switchMap(([comment]) => {
        const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
        if (!authorId) {
          return Rx.Observable.of({ comment, author: null });
        }

        const author$ = userByIdStream(authorId).observable;
        return author$.map(author => ({ comment, author }));
      }).subscribe(({ comment, author }) => {
        this.setState({ comment, author });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  captureClick = (event) => {
    if (event.target.classList.contains('mention')) {
      event.preventDefault();
      const link = event.target.getAttribute('data-link');
      browserHistory.push(link);
    }
  }

  onCommentEdit = () => {
    this.setState({ editionMode: true });
  }

  onCancelEdition = () => {
    this.setState({ editionMode: false });
  }

  onCommentSave = (comment, formikActions) => {
    const { setSubmitting, setErrors } = formikActions;

    updateComment(this.props.commentId, comment)
    .then(() => {
      this.setState({ editionMode: false });
    })
    .catch((errorResponse) => {
      if (errorResponse.json) {
        const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
        setErrors(apiErrors);
        setSubmitting(false);
      }
    });
  }

  render() {
    const { comment, author } = this.state;

    if (comment && author) {
      const className = this.props['className'];
      const authorId = comment.data.relationships.author.data ? comment.data.relationships.author.data.id : null;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;

      return (
        <CommentContainer className={className}>
          <StyledMoreActionsMenu commentId={comment.data.id} authorId={authorId} onCommentEdit={this.onCommentEdit} />
          <StyledAuthor authorId={authorId} createdAt={createdAt} message="childCommentAuthor" />

          <CommentBody commentBody={commentBodyMultiloc} editionMode={this.state.editionMode} onCommentSave={this.onCommentSave} onCancelEdition={this.onCancelEdition} />
        </CommentContainer>
      );
    }

    return null;
  }
}
