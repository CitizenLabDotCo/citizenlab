import { distinctUntilChanged, map } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';

enum events {
  ideaMapCardSelectedChange = 'ideaMapCardSelectedChange',
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
