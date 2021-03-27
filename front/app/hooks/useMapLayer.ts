import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  IMapLayer,
  IMapLayerData,
  mapLayerByProjectMapConfigStream,
} from 'services/mapLayers';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  projectId?: string | null;
  mapLayerId?: string | null;
}

export type IOutput = IMapLayerData | undefined | null;

export default ({ projectId, mapLayerId }: Props): IOutput => {
  const [mapLayer, setMapLayer] = useState<IMapLayerData | undefined | null>(
    undefined
  );

  useEffect(() => {
    setMapLayer(undefined);

    let observable: Observable<IMapLayer | null> = of(null);

    if (projectId && mapLayerId) {
      observable = mapLayerByProjectMapConfigStream(projectId, mapLayerId)
        .observable;
    }

    const subscription = observable.subscribe((mapLayer) => {
      setMapLayer(!isNilOrError(mapLayer) ? mapLayer.data : null);
    });

    return () => subscription.unsubscribe();
  }, [projectId, mapLayerId]);

  return mapLayer;
};
