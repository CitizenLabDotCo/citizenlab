import React from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ICommentData, commentStream } from 'services/comments';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id?: string | null;
}

type children = (renderProps: GetCommentChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  comment: ICommentData | undefined | null | Error;
}

export type GetCommentChildProps = ICommentData | undefined | null | Error;

export default class GetComment extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      comment: undefined,
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          filter(({ id }) => isString(id)),
          switchMap(({ id }: { id: string }) => commentStream(id).observable)
        )
        .subscribe((comment) =>
          this.setState({
            comment: !isNilOrError(comment) ? comment.data : comment,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { comment } = this.state;
    return (children as children)(comment);
  }
}
