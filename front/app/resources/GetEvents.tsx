import React from 'react';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
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
  events: IEventData[] | undefined | null;
}

export type GetEventsChildProps = IEventData[] | undefined | null;

export default class GetEvents extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      events: undefined,
    };
  }

  componentDidMount() {
    const { projectId, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ events: undefined })),
          switchMap(({ projectId }) =>
            projectId
              ? eventsStream({ queryParameters: { project_id: projectId } })
                  .observable
              : of(null)
          )
        )
        .subscribe((events) =>
          this.setState({ events: events ? events.data : null })
        ),
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
    const { events } = this.state;
    return (children as children)(events);
  }
}
