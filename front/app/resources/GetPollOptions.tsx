import { isString } from 'lodash-es';
import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';

import { IPollOption, pollOptionsStream } from 'services/pollOptions';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  questionId: string;
}

type children = (renderProps: GetPollOptionsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  pollOptions: IPollOption[] | undefined | null | Error;
}

export type GetPollOptionsChildProps = IPollOption[] | undefined | null | Error;

export default class GetPollOptions extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      pollOptions: undefined,
    };
  }

  componentDidMount() {
    const { questionId } = this.props;

    this.inputProps$ = new BehaviorSubject({ questionId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => this.setState({ pollOptions: undefined })),
          filter(({ questionId }) => isString(questionId)),
          switchMap(
            ({ questionId }) => pollOptionsStream(questionId).observable
          )
        )
        .subscribe((pollOptions) =>
          this.setState({
            pollOptions: !isNilOrError(pollOptions)
              ? pollOptions.data
              : pollOptions,
          })
        ),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { pollOptions } = this.state;
    return (children as children)(pollOptions);
  }
}
