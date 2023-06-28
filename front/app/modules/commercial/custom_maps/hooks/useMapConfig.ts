import { useState, useEffect } from 'react';
import {
  mapConfigByProjectStream,
  IMapConfigData,
  IMapConfig,
} from '../services/mapConfigs';
import { isNilOrError } from 'utils/helperUtils';
import { of, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Props {
  projectId?: string | null;
}

export type IMapConfigState = IMapConfigData | undefined | null;

export default ({ projectId }: Props): IMapConfigState => {
  const [mapConfig, setMapConfig] = useState<IMapConfigData | undefined | null>(
    undefined
  );

  useEffect(() => {
    setMapConfig(undefined);

    let observable: Observable<IMapConfig | null> = of(null);

    if (projectId) {
      observable = mapConfigByProjectStream(projectId).observable.pipe(
        switchMap((mapConfig) => {
          return of(mapConfig);
        })
      );
    }

    const subscription = observable.subscribe((mapConfig) => {
      setMapConfig(!isNilOrError(mapConfig) ? mapConfig.data : null);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return mapConfig;
};
