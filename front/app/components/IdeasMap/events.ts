import { distinctUntilChanged, map } from 'rxjs/operators';
import { isEqual } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';

enum events {
  ideaMapSelectedIdeaChange = 'ideaMapSelectedIdeaChange',
}

// ---------

export function setIdeaMapSelectedIdea(ideaId: string | null) {
  eventEmitter.emit<string | null>(events.ideaMapSelectedIdeaChange, ideaId);
}

export const ideaMapSelectedIdea$ = eventEmitter
  .observeEvent<string | null>(events.ideaMapSelectedIdeaChange)
  .pipe(
    map(({ eventValue }) => eventValue),
    distinctUntilChanged((x, y) => isEqual(x, y))
  );

// ---------
