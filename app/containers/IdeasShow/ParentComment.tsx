import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Authorize from 'utils/containers/authorize';
import ChildComment from './ChildComment';
import Author from './Author';
import Button from 'components/UI/Button';
import EditorForm from './EditorForm';

// services
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';

// i18n
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from './messages';

// analytics
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

const ThreadContainer = styled.div`
  margin-top: 25px;
`;

const AuthorContainer = styled.div`
  padding: 10px 0;
`;

const CommentBody = styled.div`
  font-size: 16px;
  color: #8f8f8f;
  padding: 25px;
  border: solid 1px #cdcdcd;
  border-radius: 3px;
`;

const ReactButton = styled(Button)`
  margin-left: auto;
  margin-top: 20px;
`;

type Props = {
  commentId: string;
};

type State = {
  comment: IComment | null;
  showForm: boolean;
};

type Tracks = {
  clickReply: Function;
};

class ParentComment extends React.PureComponent<Props & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      comment: null,
      showForm: false,
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

  toggleForm = () => {
    this.props.clickReply();
    this.setState({ showForm: true });
  }

  render() {
    const { commentId } = this.props;
    const { comment, showForm } = this.state;

    if (comment) {
      const ideaId = comment.data.relationships.idea.data.id;
      const authorId = comment.data.relationships.author.data.id;
      const createdAt = comment.data.attributes.created_at;
      const commentBodyMultiloc = comment.data.attributes.body_multiloc;

      return (
        <ThreadContainer>

          <AuthorContainer>
            <Author authorId={authorId} createdAt={createdAt} />
          </AuthorContainer>

          <CommentBody>
            <T value={commentBodyMultiloc} />
          </CommentBody>

          {/*
          {children && children.map(((node) => <ChildComment key={node.id} node={node} />))}
          */}

          <Authorize action={['comments', 'create']}>
            {!showForm &&
              <ReactButton onClick={this.toggleForm}>
                <FormattedMessage {...messages.commentReplyButton} />
              </ReactButton>
            }

            {showForm && <EditorForm ideaId={ideaId} parentId={commentId} />}
          </Authorize>

        </ThreadContainer>
      );
    }

    return null;
  }
}

export default injectTracks<Props>({
  clickReply: tracks.clickReply,
})(ParentComment);
