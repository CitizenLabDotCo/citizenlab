import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IPhaseData, phaseStream } from 'services/phases';
import { isString } from 'lodash';

interface InputProps {
  id?: string | null;
}

type children = (renderProps: GetPhaseChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  phase: IPhaseData | null;
}

export type GetPhaseChildProps = IPhaseData | null;

export default class GetPhase extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      phase: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ id }) => isString(id))
        .switchMap(({ id }: { id: string }) => phaseStream(id).observable)
        .subscribe((phase) => this.setState({ phase: phase.data }))
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { phase } = this.state;
    return (children as children)(phase);
  }
}
