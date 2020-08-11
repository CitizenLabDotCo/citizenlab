import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, switchMap, tap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';

import { IPollQuestion, pollQuestionsStream } from 'services/pollQuestions';
import { isNilOrError } from 'utils/helperUtils';
import { IParticipationContextType } from 'typings';

interface InputProps {
  participationContextId: string;
  participationContextType: IParticipationContextType;
}

type children = (renderProps: GetPollQuestionsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  pollQuestions: IPollQuestion[] | undefined | null | Error;
}

export type GetPollQuestionsChildProps =
  | IPollQuestion[]
  | undefined
  | null
  | Error;

export default class GetPollQuestions extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      pollQuestions: undefined,
    };
  }

  componentDidMount() {
    const { participationContextType, participationContextId } = this.props;

    this.inputProps$ = new BehaviorSubject({
      participationContextType,
      participationContextId,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => this.setState({ pollQuestions: undefined })),
          filter(
            ({ participationContextType, participationContextId }) =>
              isString(participationContextId) &&
              ['project', 'phase'].includes(participationContextType)
          ),
          switchMap(
            ({
              participationContextType,
              participationContextId,
            }: {
              participationContextId: string;
              participationContextType: IParticipationContextType;
            }) =>
              pollQuestionsStream(
                participationContextId,
                participationContextType
              ).observable
          )
        )
        .subscribe((pollQuestions) =>
          this.setState({
            pollQuestions: !isNilOrError(pollQuestions)
              ? pollQuestions.data
              : pollQuestions,
          })
        ),
    ];
  }

  componentDidUpdate() {
    const { participationContextId, participationContextType } = this.props;
    this.inputProps$.next({ participationContextId, participationContextType });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { pollQuestions } = this.state;
    return (children as children)(pollQuestions);
  }
}
