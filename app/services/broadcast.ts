import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { IObservable } from 'utils/streams';

/*
export interface IBroadcastStream<T> {
  observable: IObservable<T>;
  next: (state: Partial<T> | ((state: T) => Partial<T>)) => void;
}
*/

class Broadcast {
  private subject: Rx.Subject<any>;
  private stream: { [key: string]: Rx.Observable<any> };

  constructor() {
    this.subject = new Rx.Subject();
    this.stream = {};
  }

  emit<T>(name: string, message: T) {
    this.subject.next({ name, message });
  }

  observe<T>(name: string): Rx.Observable<T> {
    if (!this.stream[name]) {
      this.stream[name] = this.subject
                            .filter(data => data && data.name && data.name === name)
                            .map(data => data.message)
                            .share();
    }

    return this.stream[name];
  }
}

const broadcast = new Broadcast();
export default broadcast;
