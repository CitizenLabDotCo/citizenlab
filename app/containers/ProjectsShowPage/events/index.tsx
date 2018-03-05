import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Header from '../Header';
import Event from './Event';
import ContentContainer from 'components/ContentContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// services
import { projectBySlugStream } from 'services/projects';
import { eventsStream, IEvents } from 'services/events';

// style
import styled from 'styled-components';

const EventsContainer = styled(ContentContainer)`
  background: #f9f9fa;
  padding-top: 70px;
`;

const Events = styled.div`
  margin-bottom: 100px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 29px;
  line-height: 35px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const EventList = styled.div``;

const NoEvents = styled.div`
  color: #999;
  font-size: 18px;
  font-weight: 300;
  line-height: 26px;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  events: IEvents | null;
  loaded: boolean;
};

export default class ProjectEventsPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      events: null,
      loaded: false
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .filter(slug => isString(slug))
        .switchMap((slug) => {
          const project$ = projectBySlugStream(slug).observable;
          return project$;
        }).switchMap((project) => {
          const events$ = eventsStream(project.data.id).observable;
          return events$;
        }).subscribe((events) => {
          this.setState({ events, loaded: true });
        })
    ];
  }

  componentDidUpdate() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { slug } = this.props.params;
    const { events, loaded } = this.state;

    const pastEvents = (events ? events.data.filter((event) => {
      return moment().diff(moment(event.attributes.start_at, 'YYYY-MM-DD'), 'days') > 0;
    }) : null);

    const upcomingEvents = (events ? events.data.filter((event) => {
      return moment().diff(moment(event.attributes.start_at, 'YYYY-MM-DD'), 'days') <= 0;
    }) : null);

    if (loaded) {
      return (
        <>
          <Header slug={slug} />
          <EventsContainer>
            <Events>
              <Title>
                <FormattedMessage {...messages.upcomingEvents} />
              </Title>

              {(upcomingEvents && upcomingEvents.length > 0) ? (
                <EventList className={className}>
                  {upcomingEvents.map(event => <Event key={event.id} eventId={event.id} />)}
                </EventList>
              ) : (
                <NoEvents>
                  <FormattedMessage {...messages.noUpcomingEvents} />
                </NoEvents>
              )}
            </Events>

            <Events>
              <Title>
                <FormattedMessage {...messages.pastEvents} />
              </Title>

              {(pastEvents && pastEvents.length > 0) ? (
                <EventList className={className}>
                  {pastEvents.map(event => <Event key={event.id} eventId={event.id} />)}
                </EventList>
              ) : (
                <NoEvents>
                  <FormattedMessage {...messages.noPastEvents} />
                </NoEvents>
              )}
            </Events>
          </EventsContainer>
        </>
      );
    }

    return null;
  }
}
