import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import 'moment-timezone';

// components
import Event from './Event';
import ContentContainer from 'components/ContentContainer';

// services
import { projectBySlugStream } from 'services/projects';
import { eventsStream, IEvents } from 'services/events';

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  events: IEvents | null;
};

export default class ProjectEventsPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      events: null
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$.distinctUntilChanged().filter(slug => isString(slug)).switchMap((slug) => {
        const project$ = projectBySlugStream(slug).observable;
        return project$;
      }).switchMap((project) => {
        const events$ = eventsStream(project.data.id).observable;
        return events$;
      }).subscribe((events) => {
        this.setState({ events });
      })
    ];
  }

  componentWillReceiveProps(newProps: Props) {
    this.slug$.next(newProps.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { events } = this.state;

    if (events && events.data && events.data.length > 0) {
      return (
        <ContentContainer className={className}>
          {events.data.map(event => <Event key={event.id} eventId={event.id} />)}
        </ContentContainer>
      );
    }

    return null;
  }
}
