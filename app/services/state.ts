import { IStateStream } from 'services/state';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import shallowCompare from 'utils/shallowCompare';
import { IObservable } from 'utils/streams';

export interface IInternalStateStream<T> {
  observable: IObservable<T>;
  next: (sender: string, receiver: string, state: Partial<T> | ((state: T) => Partial<T>)) => void;
}

export interface IStateStream<T> {
  observable: IObservable<T>;
  next: (state: Partial<T> | ((state: T) => Partial<T>)) => void;
  getCurrent: () => Promise<T>;
}

class State {
  private behaviorSubject: Rx.BehaviorSubject<any>;
  private stateStream: { [key: string]: IInternalStateStream<any> };

  constructor() {
    this.behaviorSubject = new Rx.BehaviorSubject(null);
    this.stateStream = {};
  }

  createStream<T>(sender: string, receiver: string, initialState?: T): IStateStream<T> {

    const debug = false;

    if (!this.stateStream[receiver]) {
      this.stateStream[receiver] = {
        next: (sender: string, receiver: string, stateUpdate: Partial<T> | ((state: T) => Partial<T>)) => {
          this.behaviorSubject.next({ sender, receiver, stateUpdate });
        },
        observable: this.behaviorSubject
          .startWith({
            sender,
            receiver,
            state: (_.isUndefined(initialState) ? null : initialState),
            stateUpdate: 'initial'
          })
          .do((data) => {
            if (debug && data && data.stateUpdate === 'initial') {
              const { sender, receiver, state, stateUpdate } = data;
              console.log('-------------');
              console.log('sender: ' + sender);
              console.log('receiver: ' + receiver);
              console.log('inital state:');
              console.log(data.state);
              console.log('-------------');
            }
          })
          .filter(data => data && data.receiver && data.receiver === receiver)
          .scan((oldData, newData) => {
            const oldState = oldData.state;
            const stateUpdate = newData.stateUpdate;
            const newState = {
              ...oldState,
              ...(_.isFunction(stateUpdate) ? (stateUpdate as Function)(oldState) : stateUpdate)
            };

            return {
              stateUpdate,
              sender: newData.sender,
              receiver: newData.receiver,
              state: newState
            };
          })
          .distinctUntilChanged((oldData, newData) => {
            const isEqual = shallowCompare(oldData.state, newData.state);

            if (!isEqual && debug) {
              console.log('-------------');
              console.log('sender: ' + newData.sender);
              console.log('receiver: ' + newData.receiver);
              console.log('old state:');
              console.log(oldData.state);
              console.log('new state: ');
              console.log(newData.state);
              console.log('state update: ');
              console.log(_.isFunction(newData.stateUpdate) ? newData.stateUpdate.toString() : newData.stateUpdate);
              console.log('-------------');
            }

            return isEqual;
          })
          .map(newData => newData.state)
          .publishReplay(1)
          .refCount()
      };
    } else if (this.stateStream[receiver] && initialState) {
      // console.log(`an initial state was already defined for the state of component with namespace ${receiver}`);
      this.stateStream[receiver].next(sender, receiver, initialState);
    }

    return {
      observable: this.stateStream[receiver].observable,
      next: (stateUpdate: Partial<T> | ((state: T) => Partial<T>)) => this.stateStream[receiver].next(sender, receiver, stateUpdate),
      getCurrent: () => this.stateStream[receiver].observable.first().toPromise()
    };
  }
}

export const state = new State();
