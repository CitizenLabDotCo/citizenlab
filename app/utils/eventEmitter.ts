import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';

interface IEventEmitterEvent<T> {
  eventSource: string;
  eventName: string;
  eventValue: T;
}

class EventEmitter {
  private subject: Subject<IEventEmitterEvent<any>>;
  private stream: { [key: string]: Observable<IEventEmitterEvent<any>> };

  constructor() {
    this.subject = new Subject();
    this.stream = {};
  }

  emit<T>(eventSource: string, eventName: string, eventValue: T) {
    this.subject.next({ eventSource, eventName, eventValue });
  }

  observeEventFromSource<T>(eventSource: string, eventName: string): Observable<IEventEmitterEvent<T>> {
    const streamName = `${eventSource}-${eventName}`;

    if (!this.stream[streamName]) {
      this.stream[streamName] = this.subject.filter(data => data.eventSource === eventSource && data.eventName === eventName).share();
    }

    return this.stream[streamName];
  }

  observeEvent<T>(eventName: string): Observable<IEventEmitterEvent<T>> {
    const streamName = eventName;

    if (!this.stream[streamName]) {
      this.stream[streamName] = this.subject.filter(data => data.eventName === eventName).share();
    }

    return this.stream[streamName];
  }
}

const eventEmitter = new EventEmitter();
export default eventEmitter;
