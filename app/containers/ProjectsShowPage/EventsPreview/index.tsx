// libraries
import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import { times, isString } from 'lodash';

// services
import { projectByIdStream } from 'services/projects';
import { eventsStream, IEventData } from 'services/events';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Transition } from 'react-transition-group';
import PreviewWrapper from './PreviewWrapper';
import EventBlock from './EventBlock';
import Button from 'components/UI/Button';

// styling
import styled from 'styled-components';

const StyledButton = styled(Button)`
  flex: 0 !important;
  justify-self: flex-end;
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
    const emptySpaceCount = Math.max(0, 3 - this.state.events.length);
    const { projectSlug, events } = this.state;

    if (projectSlug && events && events.length > 0) {
      return (
        <Transition in={events.length > 0} timeout={200}>
          {(status) => (
            <PreviewWrapper.Background className={`e2e-events-preview ${status}`}>
              <PreviewWrapper.Container>
                <h2><FormattedMessage {...messages.upcomingEvents} /></h2>
                <StyledButton circularCorners={false} style="primary-outlined" linkTo={`/projects/${projectSlug}/events`}>
                  <FormattedMessage {...messages.allEvents} />
                </StyledButton>
              </PreviewWrapper.Container>
              <PreviewWrapper.Container>
                {events.slice(0, 3).map((event) => (
                  <EventBlock event={event} key={event.id} />
                ))}
                {times(emptySpaceCount, (index) => (
                  <div className="event-placeholder" key={index}/>
                ))}
              </PreviewWrapper.Container>
            </PreviewWrapper.Background>
          )}
        </Transition>
      );      
    }

    return null;
  }
}
