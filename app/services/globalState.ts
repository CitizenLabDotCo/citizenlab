import { Observer, Observable } from 'rxjs/Rx';
import { isObject, isEmpty, has } from 'lodash';

// utils
import shallowCompare from 'utils/shallowCompare';

// typings
import { IOption, ImageFile } from 'typings';
import { setTimeout } from 'timers';

export interface IIdeasNewPageGlobalState {
  title: string | null;
  description: string | null;
  selectedTopics: IOption[] | null;
  selectedProject: IOption | null;
  position: string;
  position_coordinates: GeoJSON.Point | null;
  submitError: boolean;
  processing: boolean;
  ideaId: string | null;
  imageFile: ImageFile[] | null;
  imageId: string | null;
  imageChanged: boolean;
}

export interface IAdminFullWidth {
  enabled: boolean;
}

type valueof<T> = T[keyof T];

type State = {
  IdeasNewPage?: IIdeasNewPageGlobalState;
  AdminFullWidth?: IAdminFullWidth;
};

interface IStateInput {
  propertyName: keyof State;
  updatedStateProperties: valueof<State>;
}

interface IStream<T> {
  observer: Observer<T>;
  observable: Observable<T>;
}

export interface IGlobalStateService<T> {
  observable: Observable<T>;
  set: (newState: Partial<T>) => void;
  get: () => Promise<T>;
}

class GlobalState {
  private stream: IStream<any>;

  constructor() {
    this.stream = {
      observer: null as any,
      observable: null as any
    };

    this.stream.observable = new Observable<State>((observer) => {
      this.stream.observer = observer;
    })
    .startWith({})
    .scan((oldState: State, stateInput: IStateInput) => {
      const { propertyName, updatedStateProperties } = stateInput;

      const newState =  {
        ...oldState,
        [propertyName]: {
          ...oldState[propertyName],
          ...updatedStateProperties
        }
      };

      return newState;
    })
    .filter(state => isObject(state) && !isEmpty(state))
    .publishReplay(1)
    .refCount();

    // keep stream hot
    this.stream.observable.subscribe();
  }

  init<T>(propertyName: keyof State, initialState?: T) {
    const observable: Observable<T> = this.stream.observable
      .map(state => state[propertyName])
      .filter(filteredState => isObject(filteredState) && !isEmpty(filteredState))
      .distinctUntilChanged((filteredState, newFilteredState) => shallowCompare(filteredState, newFilteredState));

    const set = (newState: Partial<T>) => this.set(propertyName, newState);

    const get = () => this.get<T>(propertyName);

    if (initialState && isObject(initialState) && !isEmpty(initialState)) {
      if (!this.stream.observer) {
        setTimeout(() => set(initialState), 0);
      } else {
        set(initialState);
      }
    }

    return {
      observable,
      set,
      get
    } as IGlobalStateService<T>;
  }

  set<T>(propertyName: keyof State, updatedStateProperties: Partial<T>) {
    this.stream.observer.next({
      propertyName,
      updatedStateProperties
    });
  }

  get<T>(propertyName: keyof State) {
    return this.stream.observable.map((state) => {
      return has(state, propertyName) ? state[propertyName] : null;
    }).first().toPromise() as Promise<T>;
  }
}

export const globalState = new GlobalState();
