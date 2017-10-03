import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import ParentComment from './ParentComment';
import EditorForm from './EditorForm';
import Icon from 'components/UI/Icon';

// animations
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// services
import { commentsForIdeaStream, commentStream, IComments, IComment } from 'services/comments';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';

const animationDuration = 500;
const animationEasing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const Container = styled.div`
  margin-bottom: 100px;
`;

const Title = styled.h2`
  color: #444;
  font-size: 25px;
  font-weight: 400;
  margin: 0;
  padding: 0;
  margin-bottom: 30px;
`;

type Props = {
  ideaId: string;
};

type State = {
  comments: IComments | null;
  loading: boolean;
};

export default class Comments extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      comments: null,
      loading: true
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const comments$ = commentsForIdeaStream(ideaId).observable;

    this.subscriptions = [
      comments$.switchMap((comments) => {
        if (comments && comments.data && comments.data.length > 0) {
          return Rx.Observable.combineLatest(
            comments.data.map(comment => commentStream(comment.id).observable)
          ).map(() => comments);
        }

        return Rx.Observable.of(null);
      }).subscribe((comments) => {
        this.setState({ comments, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = `${this.props['className']} e2e-comments`;
    const { ideaId } = this.props;
    const { comments, loading } = this.state;

    if (!loading) {
      let commentsList: JSX.Element[] | null = null;

      if (comments && comments.data && comments.data.length > 0) {
        commentsList = comments.data.map(comment => (<ParentComment key={comment.id} commentId={comment.id} />));
      }

      return (
        <Container className={className}>
          <Title>
            <Icon name="comment outline" />
            <FormattedMessage {...messages.commentsTitle} />
          </Title>

          <EditorForm ideaId={ideaId} />

          {commentsList}
        </Container>
      );
    }

    return null;
  }
}
