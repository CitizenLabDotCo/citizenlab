import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import eventEmitter from 'utils/eventEmitter';
import { IPhaseData } from 'api/phases/types';

enum events {
  selectedPhaseChange = 'selectedPhaseChange',
}

export function selectPhase(phase: IPhaseData | undefined) {
  eventEmitter.emit<IPhaseData | undefined>(events.selectedPhaseChange, phase);
}

export const selectedPhase$ = eventEmitter
  .observeEvent<IPhaseData | undefined>(events.selectedPhaseChange)
  .pipe(
    map((event) => event.eventValue),
    distinctUntilChanged((x, y) => x?.id === y?.id),
    publishReplay(1),
    refCount()
  );
