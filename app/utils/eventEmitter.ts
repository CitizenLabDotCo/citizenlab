import * as Rx from 'rxjs/Rx';

interface IEventEmitterEvent {
  eventSource: string;
  eventName: string;
  eventValue: any;
}

class EventEmitter {
  private subject: Rx.Subject<IEventEmitterEvent>;
  private stream: { [key: string]: Rx.Observable<IEventEmitterEvent> };

  constructor() {
    this.subject = new Rx.Subject();
    this.stream = {};
  }

  emit(eventSource: string, eventName: string, eventValue: any | null = null) {
    this.subject.next({ eventSource, eventName, eventValue });
  }

  observe(eventSource: string, eventName: string) {
    const streamName = `${eventSource}-${eventName}`;

    if (!this.stream[streamName]) {
      this.stream[streamName] = this.subject.filter(data => data.eventSource === eventSource && data.eventName === eventName).share();
    }

    return this.stream[streamName];
  }
}

const eventEmitter = new EventEmitter();
export default eventEmitter;
