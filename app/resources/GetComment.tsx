import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { ICommentData, commentStream } from 'services/comments';
import { isString } from 'lodash';

interface InputProps {
  id?: string | null;
}

type children = (renderProps: GetCommentChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  comment: ICommentData | null;
}

export type GetCommentChildProps = ICommentData | null;

export default class GetComment extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      comment: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ id }) => isString(id))
        .switchMap(({ id }: { id: string }) => commentStream(id).observable)
        .subscribe((comment) => this.setState({ comment: comment.data }))
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { comment } = this.state;
    return (children as children)(comment);
  }
}
