import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import shallowCompare from 'utils/shallowCompare';

export interface IStateStream<T> {
  next: (state: T | ((arg: T) => T)) => void;
  observable: Rx.Observable<T>;
}

class State {
  private behaviorSubject: Rx.BehaviorSubject<any>;
  private stream: { [key: string]: IStateStream<any> };

  constructor() {
    this.behaviorSubject = new Rx.BehaviorSubject(null);
    this.stream = {};
  }

  observe<T>(store: string, initialState?: T): IStateStream<T> {
    if (!this.stream[store]) {
      this.stream[store] = {
        next: (state: T | ((arg: T) => T)) => { this.behaviorSubject.next({ store, state }); },
        observable: this.behaviorSubject
          .startWith({ store, state: initialState })
          .filter(data => _.has(data, 'store') && data.store === store)
          .map(data => data.state)
          .scan((oldState, updatedState) => ({ ...oldState, ...(_.isFunction(updatedState) ? updatedState(oldState) : updatedState) }))
          .distinctUntilChanged((oldState, newState) => shallowCompare(oldState, newState))
          .publishReplay(1)
          .refCount()
      };
    } else if (this.stream[store] && initialState !== undefined) {
      this.behaviorSubject.next({ store, state: initialState });
    }

    return this.stream[store];
  }
}

export const stateStream = new State();
