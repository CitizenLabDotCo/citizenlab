import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IEventData, eventsStream } from 'services/events';
import { isString } from 'lodash';

interface InputProps {
  projectId: string | null;
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
    const { projectId } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ projectId }) => isString(projectId))
        .switchMap(({ projectId }: { projectId: string }) => eventsStream(projectId).observable)
        .subscribe((events) => this.setState({ events: events.data }))
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
