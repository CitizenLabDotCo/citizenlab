import { map, publishReplay, refCount } from 'rxjs/operators';
import eventEmitter from 'utils/eventEmitter';
import { IMapLayerAttributes } from 'services/mapLayers';

enum events {
  layersUpdated = 'layersUpdated',
}

export function setLayers(layers: IMapLayerAttributes[]) {
  eventEmitter.emit<IMapLayerAttributes[]>(events.layersUpdated, layers);
}

export const layers$ = eventEmitter
  .observeEvent<IMapLayerAttributes[]>(events.layersUpdated)
  .pipe(
    map((event) => event.eventValue),
    publishReplay(1),
    refCount()
  );
