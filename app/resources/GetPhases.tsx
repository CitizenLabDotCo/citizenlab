import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IPhaseData, phasesStream } from 'services/phases';

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

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      phases: undefined
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .do(() => resetOnChange && this.setState({ phases: undefined }))
        .switchMap(({ projectId }) => projectId ? phasesStream(projectId).observable : Observable.of(null))
        .subscribe((phases) => this.setState({ phases: (phases ? phases.data : null) }))
    ];
  }

  componentDidUpdate() {
    const { projectId } = this.props;
    this.inputProps$.next({ projectId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { phases } = this.state;
    return (children as children)(phases);
  }
}
