import { useState, useEffect } from 'react';
import {
  mapConfigByProjectStream,
  IMapConfigData,
  IMapConfig,
} from 'services/mapConfigs';
import { isNilOrError } from 'utils/helperUtils';
import { combineLatest, of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { mapLayerByProjectMapConfigStream } from 'services/mapLayers';

export interface Props {
  projectId?: string | null;
  prefetchMapLayers?: boolean;
}

export type IOutput = IMapConfigData | undefined | null;

export default ({ projectId, prefetchMapLayers }: Props): IOutput => {
  const [mapConfig, setMapConfig] = useState<IMapConfigData | undefined | null>(
    undefined
  );

  useEffect(() => {
    setMapConfig(undefined);

    let observable: Observable<IMapConfig | null> = of(null);

    if (projectId) {
      observable = mapConfigByProjectStream(projectId).observable.pipe(
        switchMap((mapConfig) => {
          if (!isNilOrError(mapConfig) && prefetchMapLayers) {
            const mapLayerIds = mapConfig?.data?.attributes?.layers?.map(
              (mapLayer) => mapLayer.id
            );

            if (mapLayerIds && mapLayerIds.length > 0) {
              combineLatest(
                mapLayerIds.map(
                  (mapLayerId) =>
                    mapLayerByProjectMapConfigStream(projectId, mapLayerId)
                      .observable
                )
              );
            }
          }

          return of(mapConfig);
        })
      );
    }

    const subscription = observable.subscribe((mapConfig) => {
      setMapConfig(!isNilOrError(mapConfig) ? mapConfig.data : null);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return mapConfig;
};
