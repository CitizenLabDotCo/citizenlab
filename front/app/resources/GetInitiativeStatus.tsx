import React from 'react';
import { BehaviorSubject, Subscription, of } from 'rxjs';
import { distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import {
  IInitiativeStatusData,
  initiativeStatusStream,
} from 'services/initiativeStatuses';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id: string | null;
}

type children = (
  renderProps: GetInitiativeStatusChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeStatus: IInitiativeStatusData | undefined | null;
}

export type GetInitiativeStatusChildProps =
  | IInitiativeStatusData
  | undefined
  | null;

export default class GetInitiativeStatus extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeStatus: undefined,
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
              return initiativeStatusStream(id).observable;
            }

            return of(null);
          })
        )
        .subscribe((initiativeStatus) =>
          this.setState({
            initiativeStatus: !isNilOrError(initiativeStatus)
              ? initiativeStatus.data
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
    const { initiativeStatus } = this.state;
    return (children as children)(initiativeStatus);
  }
}
