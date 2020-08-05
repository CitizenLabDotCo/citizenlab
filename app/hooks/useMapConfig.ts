import { useState, useEffect } from 'react';
import { mapConfigByProjectStream, IMapConfigData } from 'services/mapConfigs';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  projectId: string;
}

export type IOutput = IMapConfigData | undefined | null | Error;

export default ({ projectId }: Props): IOutput => {
  const [mapConfig, setMapConfig] = useState<
    IMapConfigData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const subscription = mapConfigByProjectStream(
      projectId
    ).observable.subscribe((mapConfig) => {
      setMapConfig(!isNilOrError(mapConfig) ? mapConfig.data : mapConfig);
    });

    return () => subscription.unsubscribe();
  }, []);

  return mapConfig;
};
