import { useState, useEffect } from 'react';
import { mapConfigByProjectStream, IMapConfigData } from 'services/mapConfigs';

export interface Props {
  projectId: string | null;
}

export type IOutput = IMapConfigData | undefined | null | Error;

export default ({ projectId } : Props) : IOutput => {

  if (projectId) {
    const [mapConfig, setMapConfig] = useState<IMapConfigData | undefined | null | Error>(undefined);

    useEffect(() => {
      const subscription = mapConfigByProjectStream(projectId).observable.subscribe((mapConfig) => {
        setMapConfig(mapConfig.data);
      });

      return () => subscription.unsubscribe();
    }, []);

    return mapConfig;
  }

  return null;
};
