import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IInitiativeAllowedTransitions,
  initiativeAllowedTransitionsStream,
} from 'services/initiatives';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string | null;
}

type children = (
  renderProps: GetInitiativeAllowedTransitionsChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeAllowedTransitions:
    | IInitiativeAllowedTransitions
    | undefined
    | null;
}

export type GetInitiativeAllowedTransitionsChildProps =
  | IInitiativeAllowedTransitions
  | undefined
  | null;

export default class GetInitiativeAllowedTransitions extends React.Component<
  Props,
  State
> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeAllowedTransitions: undefined,
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
          switchMap(({ id }: { id: string }) => {
            if (isString(id)) {
              return initiativeAllowedTransitionsStream(id).observable;
            }

            return of(null);
          })
        )
        .subscribe((initiativeAllowedTransitions) =>
          this.setState({
            initiativeAllowedTransitions: !isNilOrError(
              initiativeAllowedTransitions
            )
              ? initiativeAllowedTransitions
              : null,
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
    const { initiativeAllowedTransitions } = this.state;
    return (children as children)(initiativeAllowedTransitions);
  }
}
