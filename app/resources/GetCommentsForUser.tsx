import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ICommentData, commentsForUserStream } from 'services/comments';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  userId: string | null | undefined;
}

type children = (renderProps: GetCommentsForUserChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  comments: ICommentData[] | undefined | null | Error;
}

export type GetCommentsForUserChildProps = ICommentData[] | undefined | null | Error;

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
    const { userId } = this.props;

    this.inputProps$ = new BehaviorSubject({ userId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        filter(({ userId }) => isString(userId)),
        switchMap(({ userId }: { userId: string }) => {
          return commentsForUserStream(userId, {
            queryParameters: {
              'page[number]': 1,
              'page[size]': 500
            }
          }).observable;
        })
      )
      .subscribe((comments) => this.setState({ comments: !isNilOrError(comments) ? comments.data : comments }))
    ];
  }

  componentDidUpdate() {
    const { userId } = this.props;
    this.inputProps$.next({ userId });
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
