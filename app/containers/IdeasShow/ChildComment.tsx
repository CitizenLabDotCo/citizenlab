import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Author from './Author';

// services
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';

// i18n
import messages from './messages';
import T from 'components/T';

// style
import styled from 'styled-components';

const CommentContainer = styled.div`
  border: solid 1px #cdcdcd;
  padding: 25px;
  border-top: none;
`;

const CommentBody = styled.div`
  font-size: 16px;
  color: #8f8f8f;
  padding: 15px 0 15px 50px;
`;

type Props = {
  commentId: string;
  createdAt: string;
};

type State = {
  comment: IComment | null;
};

export default class ChildComment extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      comment: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { commentId } = this.props;
    const comment$ = commentStream(commentId).observable;

    this.subscriptions = [
      comment$.subscribe(comment => this.setState({ comment }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { createdAt } = this.props;
    const { comment } = this.state;

    if (comment) {
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data.id;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;

      return (
        <div>
          <CommentContainer>
            <Author authorId={authorId} createdAt={createdAt} />
            <CommentBody>
              <T value={commentBodyMultiloc} />
            </CommentBody>
          </CommentContainer>
        </div>
      );
    }

    return null;
  }
}
