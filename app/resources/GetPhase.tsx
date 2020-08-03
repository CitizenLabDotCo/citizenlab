import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap, filter, tap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IPhaseData, phaseStream } from 'services/phases';
import { isString } from 'lodash-es';

interface InputProps {
  id?: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetPhaseChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  phase: IPhaseData | undefined | null;
}

export type GetPhaseChildProps = IPhaseData | undefined | null;

export default class GetPhase extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      phase: undefined,
    };
  }

  componentDidMount() {
    const { id, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ phase: undefined })),
          filter(({ id }) => isString(id)),
          switchMap(({ id }: { id: string }) => phaseStream(id).observable)
        )
        .subscribe((phase) => {
          this.setState({ phase: phase.data });
        }),
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
    const { phase } = this.state;
    return (children as children)(phase);
  }
}
