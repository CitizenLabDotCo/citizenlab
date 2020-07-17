import React from 'react';
import { isString } from 'lodash-es';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { ICommentVoteData, commentVoteStream } from 'services/commentVotes';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  voteId?: string;
  resetOnChange?: boolean;
}

type children = (renderProps: GetCommentVoteChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  commentVote: ICommentVoteData | undefined | null | Error;
}

export type GetCommentVoteChildProps =
  | ICommentVoteData
  | undefined
  | null
  | Error;

export default class GetCommentVote extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      commentVote: undefined,
    };
  }

  componentDidMount() {
    const { voteId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ voteId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ commentVote: undefined })),
          switchMap(({ voteId }) => {
            if (isString(voteId)) {
              return commentVoteStream(voteId).observable;
            }

            return of(null);
          })
        )
        .subscribe((commentVote) =>
          this.setState({
            commentVote: !isNilOrError(commentVote)
              ? commentVote.data
              : commentVote,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { voteId } = this.props;
    this.inputProps$.next({ voteId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { commentVote } = this.state;
    return (children as children)(commentVote);
  }
}
