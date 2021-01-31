import { useState, useEffect, useCallback } from 'react';
import {
  IMapLayer,
  IMapLayerData,
  IMapLayerAttributes,
  mapLayerByProjectMapConfigStream,
  createProjectMapLayer,
  deleteProjectMapLayer,
  updateProjectMapLayer,
} from 'services/mapLayers';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  projectId: string;
  mapLayerId?: string;
}

export type IOutput = {
  mapLayer: IMapLayerData | undefined | null | Error;
  deleteMapLayer: () => Promise<boolean> | void;
  createMapLayer: (
    mapLayerAttributes: IMapLayerAttributes
  ) => Promise<IMapLayer>;
  updateMapLayer: (
    mapLayerAttributes: IMapLayerAttributes
  ) => Promise<IMapLayer> | void;
};

export default ({ projectId, mapLayerId }: Props): IOutput => {
  const [mapLayer, setMapLayer] = useState<
    IMapLayerData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    if (isNilOrError(mapLayerId)) return;

    const subscription = mapLayerByProjectMapConfigStream(
      projectId,
      mapLayerId
    ).observable.subscribe((mapLayer) => {
      setMapLayer(!isNilOrError(mapLayer) ? mapLayer.data : mapLayer);
    });

    return () => subscription.unsubscribe();
  }, [mapLayerId]);

  const createMapLayer = useCallback(
    (mapLayerAttributes: IMapLayerAttributes) => {
      return createProjectMapLayer(projectId, mapLayerAttributes);
    },
    [projectId, mapLayerId]
  );

  const updateMapLayer = useCallback(
    (mapLayerAttributes: IMapLayerAttributes) => {
      if (isNilOrError(mapLayerId) && !mapLayerId) return;

      return updateProjectMapLayer(projectId, mapLayerId, mapLayerAttributes);
    },
    [projectId, mapLayerId]
  );

  const deleteMapLayer = useCallback(() => {
    if (isNilOrError(mapLayerId) && !mapLayerId) return;

    return deleteProjectMapLayer(projectId, mapLayerId);
  }, [projectId, mapLayerId]);

  return {
    mapLayer,
    deleteMapLayer,
    updateMapLayer,
    createMapLayer,
  };
};
