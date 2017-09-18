import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import shallowCompare from 'utils/shallowCompare';
import { IObservable, IObserver } from 'utils/streams';
import { v4 as uuid } from 'uuid';

export interface IStateStream<T> {
  observable: Rx.Observable<T>;
  next: (state: Partial<T> | ((state: T) => Partial<T>)) => void;
  getCurrent: () => Promise<T>;
}

export function stateStream<T>(initialState: T): IStateStream<T> {
  const behaviorSubject = new Rx.BehaviorSubject<T>(initialState);
  const observable = behaviorSubject.scan<T>((state, reducer) => ({
      ...state as any,
      ...(_.isFunction(reducer) ? reducer(state) : reducer)
  }), initialState).distinctUntilChanged((oldState, newState) => shallowCompare(oldState, newState)).shareReplay(1);
  const next = (stateUpdate: Partial<T> | ((state: T) => Partial<T>)) => behaviorSubject.next(stateUpdate as T);
  const getCurrent = () => observable.first().toPromise();

  return {
    observable,
    next,
    getCurrent
  };
}
