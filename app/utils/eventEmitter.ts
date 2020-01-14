import { Subject, Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';

export interface IEventEmitterEvent<T> {
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

  observeEvent<T>(eventName: string): Observable<IEventEmitterEvent<T>> {
    const streamName = eventName;

    if (!this.stream[streamName]) {
      this.stream[streamName] = this.subject.pipe(
        filter(data => data.eventName === eventName),
        share()
      );
    }

    return this.stream[streamName];
  }
}

const eventEmitter = new EventEmitter();
export default eventEmitter;
