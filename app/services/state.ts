import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import shallowCompare from 'utils/shallowCompare';
import { IObservable } from 'utils/streams';

export interface IStateStream<T> {
  observable: IObservable<T>;
  next: (state: Partial<T> | ((state: T) => Partial<T>)) => void;
}

class State {
  private behaviorSubject: Rx.BehaviorSubject<any>;
  private stream: { [key: string]: IStateStream<any> };

  constructor() {
    this.behaviorSubject = new Rx.BehaviorSubject(null);
    this.stream = {};
  }

  observe<T>(name: string, initialState?: T): IStateStream<T> {
    if (!this.stream[name]) {
      this.stream[name] = {
        next: (state: Partial<T> | ((state: T) => Partial<T>)) => { this.behaviorSubject.next({ name, state }); },
        observable: this.behaviorSubject
          .startWith({ name, state: (initialState !== undefined ? initialState : null) })
          .filter(data => data && data.name && data.name === name)
          .map(data => data.state)
          .scan((oldState, updatedState) => ({ ...oldState, ...(_.isFunction(updatedState) ? updatedState(oldState) : updatedState) }))
          .distinctUntilChanged((oldState, newState) => shallowCompare(oldState, newState))
          .publishReplay(1)
          .refCount()
      };
    } else if (this.stream[name] && initialState) {
      this.behaviorSubject.next({ name, state: initialState });
    }

    return this.stream[name];
  }
}

export const stateStream = new State();
