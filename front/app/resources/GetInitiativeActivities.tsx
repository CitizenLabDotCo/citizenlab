import React from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { initiativeActivities, InitiativeActivity } from 'services/initiatives';

interface InputProps {
  initiativeId: string | null;
}

type children = (
  renderProps: GetInitiativeActivitiesChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  initiativeActivities: InitiativeActivity[] | undefined | null;
}

export type GetInitiativeActivitiesChildProps =
  | InitiativeActivity[]
  | undefined
  | null;

export default class GetInitiativeActivities extends React.Component<
  Props,
  State
> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      initiativeActivities: undefined,
    };
  }

  componentDidMount() {
    const { initiativeId } = this.props;

    this.inputProps$ = new BehaviorSubject({ initiativeId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ initiativeId }) =>
            isString(initiativeId)
              ? initiativeActivities(initiativeId).observable
              : of(null)
          )
        )
        .subscribe((initiativeActivities) => {
          this.setState({
            initiativeActivities: !isNilOrError(initiativeActivities)
              ? initiativeActivities.data
              : initiativeActivities,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { initiativeId } = this.props;
    this.inputProps$.next({ initiativeId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { initiativeActivities } = this.state;
    return (children as children)(initiativeActivities);
  }
}
