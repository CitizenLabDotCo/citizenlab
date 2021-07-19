import React from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IEventData, eventsStream, IEventsStreamParams } from 'services/events';

interface InputProps {
  projectIds?: string[];
  futureOnly?: boolean;
  pastOnly?: boolean;
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
    const { projectIds, resetOnChange, futureOnly, pastOnly } = this.props;

    this.inputProps$ = new BehaviorSubject({
      projectIds,
      futureOnly,
      pastOnly,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ events: undefined })),
          switchMap(({ projectIds, futureOnly, pastOnly }) => {
            const queryParameters: IEventsStreamParams['queryParameters'] = {
              project_ids: projectIds,
            };

            if (futureOnly) {
              queryParameters.start_at_gteq = new Date().toJSON();
            }

            if (pastOnly) {
              queryParameters.start_at_lt = new Date().toJSON();
            }

            return eventsStream({ queryParameters }).observable;
          })
        )
        .subscribe((events) =>
          this.setState({ events: events ? events.data : null })
        ),
    ];
  }

  componentDidUpdate() {
    const { projectIds } = this.props;
    this.inputProps$.next({ projectIds });
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
