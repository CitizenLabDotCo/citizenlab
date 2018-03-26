import * as React from 'react';
import { size, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ParentComment from './ParentComment';

// services
import { commentsForIdeaStream, commentStream, IComments } from 'services/comments';

// style
import styled from 'styled-components';

const Container = styled.div`
  padding: 0;
  margin: 0;
`;

type Props = {
  ideaId: string;
};

type State = {
  parentComments: IComments | null;
  loaded: boolean;
  newCommentId: string | null;
};

export default class CommentsContainer extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      parentComments: null,
      loaded: false,
      newCommentId: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { ideaId } = this.props;
    const parentComments$ = commentsForIdeaStream(ideaId).observable.switchMap((comments) => {
      if (comments && comments.data && comments.data.length > 0) {
        const parentComments: IComments = {
          data: comments.data.filter(comment => comment.relationships.parent.data === null)
        };

        return Rx.Observable
          .combineLatest(comments.data.map(comments => commentStream(comments.id).observable))
          .map(() => size(parentComments) > 0 ? parentComments : null);
      }

      return Rx.Observable.of(null);
    });

    this.subscriptions = [
      parentComments$.subscribe((parentComments) => {
        let sortedParentComments: IComments | null = null;
        let newCommentId: string | null = null;

        if (parentComments && parentComments.data && parentComments.data.length > 0) {
          sortedParentComments = {
            ...parentComments,
            data: parentComments.data.reverse()
          };
        }

        if (this.state.loaded) {
          const oldParentCommentsSize = size(get(this.state.parentComments, 'data', null));
          const newParentCommentsSize = size(get(sortedParentComments, 'data', null));

          if (newParentCommentsSize === (oldParentCommentsSize + 1)) {
            newCommentId = (sortedParentComments as IComments).data[0].id;
          }
        }

        this.setState({
          newCommentId,
          parentComments: sortedParentComments,
          loaded: true
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  commentsSortingFunc = (commentA, commentB) => {
    return new Date(commentA.attributes.created_at).getTime() - new Date(commentB.attributes.created_at).getTime();
  }

  render() {
    const className = `${this.props['className']} e2e-comments`;
    const { ideaId } = this.props;
    const { parentComments, loaded, newCommentId } = this.state;

    if (loaded && parentComments && parentComments.data && parentComments.data.length > 0) {
      return (
        <Container className={`e2e-comments-container ${className}`}>
          {parentComments.data.sort(this.commentsSortingFunc).map((comment) => (
            <ParentComment
              key={comment.id}
              ideaId={ideaId}
              commentId={comment.id}
              animate={(newCommentId === comment.id)}
            />
          ))}
        </Container>
      );
    }

    return null;
  }
}
