import { Observer, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  startWith,
  scan,
  refCount,
  publishReplay,
  first,
} from 'rxjs/operators';
import { isObject, isEmpty, has } from 'lodash-es';

// utils
import shallowCompare from 'utils/shallowCompare';

// typings
import { UploadFile } from 'typings';

export interface IIdeasPageGlobalState {
  title: string | null;
  description: string | null;
  selectedTopics: string[];
  budget: number | null;
  proposedBudget: number | null;
  position: string;
  position_coordinates: GeoJSON.Point | null;
  submitError: boolean;
  fileOrImageError: boolean;
  processing: boolean;
  ideaId: string | null;
  ideaSlug: string | null;
  imageFile: UploadFile[];
  imageId: string | null;
  ideaFiles: UploadFile[];
}

export interface IAdminFullWidth {
  enabled: boolean;
}

export interface IAdminNoPadding {
  enabled: boolean;
}

type valueof<T> = T[keyof T];

type State = {
  IdeasNewPage?: IIdeasPageGlobalState;
  IdeasEditPage?: IIdeasPageGlobalState;
  AdminFullWidth?: IAdminFullWidth;
  AdminNoPadding?: IAdminNoPadding;
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
      observable: null as any,
    };

    this.stream.observable = new Observable<State>((observer) => {
      this.stream.observer = observer;
    }).pipe(
      startWith({}),
      scan((oldState: State, stateInput: IStateInput) => {
        const { propertyName, updatedStateProperties } = stateInput;

        const newState = {
          ...oldState,
          [propertyName]: {
            ...oldState[propertyName],
            ...updatedStateProperties,
          },
        };

        return newState;
      }),
      filter((state) => isObject(state) && !isEmpty(state)),
      publishReplay(1),
      refCount()
    );

    // keep stream hot
    this.stream.observable.subscribe();
  }

  init<T>(propertyName: keyof State, initialState?: T) {
    const observable: Observable<T> = this.stream.observable.pipe(
      map((state) => state[propertyName]),
      filter(
        (filteredState) => isObject(filteredState) && !isEmpty(filteredState)
      ),
      distinctUntilChanged((filteredState, newFilteredState) =>
        shallowCompare(filteredState, newFilteredState)
      )
    );

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
      get,
    } as IGlobalStateService<T>;
  }

  set<T>(propertyName: keyof State, updatedStateProperties: Partial<T>) {
    this.stream.observer.next({
      propertyName,
      updatedStateProperties,
    });
  }

  get<T>(propertyName: keyof State) {
    return this.stream.observable
      .pipe(
        map((state) => (has(state, propertyName) ? state[propertyName] : null)),
        first()
      )
      .toPromise() as Promise<T>;
  }
}

export const globalState = new GlobalState();
