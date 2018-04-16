import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IPhaseData, phasesStream } from 'services/phases';
import { isString } from 'lodash';

interface InputProps {
  projectId?: string | null | undefined;
}

type children = (renderProps: GetPhasesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  phases: IPhaseData[] | null;
}

export type GetPhasesChildProps = IPhaseData[] | null;

export default class GetPhases extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      phases: null
    };
  }

  componentDidMount() {
    const { projectId } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ projectId }) => isString(projectId))
        .switchMap(({ projectId }: { projectId: string }) => phasesStream(projectId).observable)
        .subscribe((phases) => this.setState({ phases: phases.data }))
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
