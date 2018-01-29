// libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { isString } from 'lodash';

// services
import { projectByIdStream } from 'services/projects';
import { eventsStream, IEventData } from 'services/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
// import { Transition } from 'react-transition-group';
import EventBlock from './EventBlock';
import Button from 'components/UI/Button';
import ContentContainer from 'components/ContentContainer';

// styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  background: #f9f9f9;
  padding-top: 80px;
  padding-bottom: 90px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Events = styled.div`
  display: flex;
  margin-left: -13px;
  margin-right: -13px;

  ${media.smallerThanMaxTablet`
    margin: 0;
    flex-direction: column;
  `}
`;

type Props = {
  projectId: string;
};

type State = {
  projectSlug: string | null;
  events: IEventData[];
};

export default class EventsPreview extends React.Component<Props, State> {
  projectId$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      projectSlug: null,
      events: []
    };
    this.projectId$ = new Rx.BehaviorSubject(null as any);
  }

  componentWillMount() {
    this.projectId$.next(this.props.projectId);

    this.subscriptions = [
      this.projectId$.distinctUntilChanged().filter(projectId => isString(projectId)).switchMap((projectId) => {
        const projectSlug$ = projectByIdStream(projectId).observable.map(project => project.data.attributes.slug);
        const events$ = eventsStream(projectId).observable;
        
        return Rx.Observable.combineLatest(
          projectSlug$,
          events$
        );
      }).subscribe(([projectSlug, events]) => {
        let eventsArray: IEventData[] = [];

        if (events && events.data && events.data.length > 0) {
          const now = moment();

          eventsArray = events.data.filter((event) => {
            return moment(event.attributes.start_at).isSameOrAfter(now, 'day');
          });
        }

        this.setState({
          projectSlug,
          events: eventsArray
        });
      })
    ];
  }

  componentWillReceiveProps(newProps) {
    this.projectId$.next(newProps.projectId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    // const emptySpaceCount = Math.max(0, 3 - this.state.events.length);
    const { projectSlug, events } = this.state;

    if (projectSlug && events && events.length > 0) {
      return (
        <Container className={`e2e-events-preview`}>
          <ContentContainer>
            <Header>
              <h2>
                <FormattedMessage {...messages.upcomingEvents} />
              </h2>
              <Button circularCorners={false} style="primary-outlined" linkTo={`/projects/${projectSlug}/events`}>
                <FormattedMessage {...messages.allEvents} />
              </Button>
            </Header>

            <Events>
              {events.slice(0, 3).map((event, index) => (
                <EventBlock event={event} key={event.id} projectSlug={projectSlug} isLast={(index === 2)} />
              ))}
            </Events>
          </ContentContainer>
        </Container>
      );      
    }

    return null;
  }
}
