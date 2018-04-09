import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaStatusData, ideaStatusStream } from 'services/ideaStatuses';

interface InputProps {
  id: string;
}

interface Props extends InputProps {
  children: (state: GetIdeaStatusChildProps) => JSX.Element | null;
}

interface State {
  ideaStatus: IIdeaStatusData | null;
}

export type GetIdeaStatusChildProps = State;

export default class GetIdeaStatus extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaStatus: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id }) => ideaStatusStream(id).observable)
        .subscribe((ideaStatus) => this.setState({ ideaStatus: ideaStatus.data }))
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
    const { ideaStatus } = this.state;
    return children({ ideaStatus });
  }
}
