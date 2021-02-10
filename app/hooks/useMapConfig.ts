import { useState, useEffect } from 'react';
import { mapConfigByProjectStream, IMapConfigData } from 'services/mapConfigs';
import { isNilOrError } from 'utils/helperUtils';
import { combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { mapLayerByProjectMapConfigStream } from 'services/mapLayers';

export interface Props {
  projectId: string;
  prefetchMapLayers?: boolean;
}

export type IOutput = IMapConfigData | undefined | null;

export default ({ projectId, prefetchMapLayers }: Props): IOutput => {
  const [mapConfig, setMapConfig] = useState<IMapConfigData | undefined | null>(
    undefined
  );

  useEffect(() => {
    const subscription = mapConfigByProjectStream(projectId)
      .observable.pipe(
        switchMap((mapConfig) => {
          if (!isNilOrError(mapConfig) && prefetchMapLayers) {
            const mapLayerIds = mapConfig?.data?.attributes?.layers?.map(
              (mapLayer) => mapLayer.id
            );

            combineLatest(
              mapLayerIds.map(
                (mapLayerId) =>
                  mapLayerByProjectMapConfigStream(projectId, mapLayerId)
                    .observable
              )
            );
          }

          return of(mapConfig);
        })
      )
      .subscribe((mapConfig) => {
        setMapConfig(!isNilOrError(mapConfig) ? mapConfig.data : null);
      });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return mapConfig;
};
