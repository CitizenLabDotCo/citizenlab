import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IEventData, eventsStream } from 'services/events';

interface InputProps {
  projectId: string | null;
  resetOnChange?: boolean;
}

type children = (renderProps: GetEventsChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  events: IEventData[] | null;
}

export type GetEventsChildProps = IEventData[] | null;

export default class GetEvents extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      events: null
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .do(() => resetOnChange && this.setState({ events: null }))
        .switchMap(({ projectId }) => projectId ? eventsStream(projectId).observable : Observable.of(null))
        .subscribe((events) => this.setState({ events: (events ? events.data : null) }))
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
    const { events } = this.state;
    return (children as children)(events);
  }
}
