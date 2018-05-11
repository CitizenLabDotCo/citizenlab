import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { ICommentData, commentsForIdeaStream } from 'services/comments';
import { isString } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  ideaId?: string | null | undefined;
}

type children = (renderProps: GetCommentsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  comments: ICommentData[] | undefined | null | Error;
}

export type GetCommentsChildProps = ICommentData[] | undefined | null | Error;

export default class GetComments extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      comments: undefined
    };
  }

  componentDidMount() {
    const { ideaId } = this.props;

    this.inputProps$ = new BehaviorSubject({ ideaId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ ideaId }) => isString(ideaId))
        .switchMap(({ ideaId }: { ideaId: string }) => commentsForIdeaStream(ideaId).observable)
        .subscribe((comments) => this.setState({ comments: !isNilOrError(comments) ? comments.data : comments }))
    ];
  }

  componentDidUpdate() {
    const { ideaId } = this.props;
    this.inputProps$.next({ ideaId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { comments } = this.state;
    return (children as children)(comments);
  }
}
