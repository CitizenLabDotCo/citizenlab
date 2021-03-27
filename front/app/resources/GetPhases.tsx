import React from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IPhaseData, phasesStream } from 'services/phases';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  projectId?: string | null | undefined;
  resetOnChange?: boolean;
}

type children = (renderProps: GetPhasesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  phases: IPhaseData[] | undefined | null;
}

export type GetPhasesChildProps = IPhaseData[] | undefined | null;

export default class GetPhases extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      phases: undefined,
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ phases: undefined })),
          switchMap(({ projectId }) => {
            if (projectId) {
              return phasesStream(projectId).observable;
            }

            return of(null);
          })
        )
        .subscribe((phases) => {
          this.setState({
            phases: !isNilOrError(phases) ? phases.data : phases,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectId } = this.props;
    this.inputProps$.next({ projectId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { phases } = this.state;
    return (children as children)(phases);
  }
}
