import {
  distinctUntilChanged,
  map,
  publishReplay,
  refCount,
} from 'rxjs/operators';
import { IPhaseData } from 'services/phases';
import eventEmitter from 'utils/eventEmitter';

enum events {
  selectedPhaseChange = 'selectedPhaseChange',
}

export function selectPhase(phase: IPhaseData | null) {
  eventEmitter.emit<IPhaseData | null>(events.selectedPhaseChange, phase);
}

export const selectedPhase$ = eventEmitter
  .observeEvent<IPhaseData | null>(events.selectedPhaseChange)
  .pipe(
    map((event) => event.eventValue),
    distinctUntilChanged((x, y) => x?.id === y?.id),
    publishReplay(1),
    refCount()
  );
