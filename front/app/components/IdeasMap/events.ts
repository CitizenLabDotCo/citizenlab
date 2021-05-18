import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { Sort } from 'resources/GetIdeas';

enum events {
  ideaMapCardSelectedChange = 'ideaMapCardSelectedChange',
  ideasSearchChange = 'ideasSearchChange',
  ideasSortChange = 'ideasSortChange',
  ideasTopicsChange = 'ideasTopicsChange',
}

// ---------

export function setIdeaMapCardSelected(ideaId: string | null) {
  eventEmitter.emit<string | null>(events.ideaMapCardSelectedChange, ideaId);
}

export const ideaMapCardSelected$ = eventEmitter
  .observeEvent<string | null>(events.ideaMapCardSelectedChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y))
  );

// ---------

export function setIdeasSort(sort: Sort) {
  eventEmitter.emit<string | null>(events.ideasSortChange, sort);
}

export const ideasSort$ = eventEmitter
  .observeEvent<Sort>(events.ideasSortChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y)),
    publishReplay(1),
    refCount()
  );

// ---------

export function setIdeasSearch(searchValue: string | null) {
  eventEmitter.emit<string | null>(events.ideasSearchChange, searchValue);
}

export const ideasSearch$ = eventEmitter
  .observeEvent<string | null>(events.ideasSearchChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y)),
    publishReplay(1),
    refCount()
  );

// ---------

export function setIdeasTopics(topics: string[]) {
  eventEmitter.emit<string[]>(events.ideasTopicsChange, topics);
}

export const ideasTopics$ = eventEmitter
  .observeEvent<string[]>(events.ideasTopicsChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y)),
    publishReplay(1),
    refCount()
  );

// ---------
