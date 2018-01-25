import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import * as moment from 'moment';
import 'moment-timezone';

// components
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

const Container = styled(ContentContainer)`
  background: #f8f8f8;
`;

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 50px;
`;

const Events = styled.div`
  margin-bottom: 120px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 20px;
`;

const EventList = styled.div``;

const NoEvents = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 400;
  line-height: 23px;
`;

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

    const pastEvents = (events ? events.data.filter((event) => {
      return moment().diff(moment(event.attributes.start_at, 'YYYY-MM-DD'), 'days') > 0;
    }) : null);

    const upcomingEvents = (events ? events.data.filter((event) => {
      return moment().diff(moment(event.attributes.start_at, 'YYYY-MM-DD'), 'days') <= 0;
    }) : null);

    if (events && events.data && events.data.length > 0) {
      return (
        <Container>
          <StyledContentContainer>
            <Events>
              <Title>
                <FormattedMessage {...messages.upcomingEvents} />
              </Title>

              {upcomingEvents ? (
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

              {pastEvents ? (
                <EventList className={className}>
                  {pastEvents.map(event => <Event key={event.id} eventId={event.id} />)}
                </EventList>
              ) : (
                <NoEvents>
                  <FormattedMessage {...messages.noPastEvents} />
                </NoEvents>
              )}
            </Events>
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
}
