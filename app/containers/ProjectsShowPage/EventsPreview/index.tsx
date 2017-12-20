// Libraries
import * as React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import * as moment from 'moment';
import { times } from 'lodash';

// Services
import { eventsStream, IEventData } from 'services/events';
import { Observable } from 'rxjs/Observable';

// Components
import { Transition } from 'react-transition-group';
import PreviewWrapper from './PreviewWrapper';
import EventBlock from './EventBlock';

// Typing
interface Props {
  projectId: string | null;
}

interface State {
  events: IEventData[];
}

class EventsPreview extends React.Component<Props, State> {
  projectId$: BehaviorSubject<string> = new BehaviorSubject('');
  sub: Subscription;

  constructor(props) {
    super(props);

    this.state = {
      events: [],
    };
  }

  componentWillMount() {
    this.sub = this.projectId$
    .switchMap((projectId) => {
      if (projectId) {
        return eventsStream(projectId).observable;
      }
      return Observable.of({ data: [] });
    })
    .map((eventsResponse) => {
      return eventsResponse.data;
    })
    .subscribe((events) => {
      const now = moment();
      this.setState({
        events: events.filter((event) => {
          return moment(event.attributes.start_at).isAfter(now, 'minutes');
        })
      });
    });
  }

  componentDidMount() {
    this.projectId$.next(this.props.projectId || '');
  }

  componentWillReceiveProps(newProps) {
    if (this.props.projectId !== newProps.projectId) {
      this.projectId$.next(newProps.projectId);
    }
  }

  componentWillUnmount() {
    this.sub.unsubscribe();
  }

  render() {
    const emptySpaceCount = Math.max(0, 3 - this.state.events.length);

    return (
      <Transition in={this.state.events.length > 0} timeout={200}>
        {(status) => (
          <PreviewWrapper.Background className={`e2e-events-preview ${status}`}>
            <PreviewWrapper.Container>
              {this.state.events.slice(0, 3).map((event) => (
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
}

export default EventsPreview;
