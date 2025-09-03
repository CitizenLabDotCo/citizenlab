import React, { useMemo } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import surveyResultMessages from 'components/admin/FormResults/messages';
import PolygonMap from 'components/admin/Graphs/PolygonMap';

import { useIntl } from 'utils/cl-intl';

interface Props {
  polygonResponses: { answer: GeoJSON.Polygon }[];
  mapConfigId?: string;
  customFieldId: string;
  projectId: string;
}

const PolygonLocationQuestion = ({
  polygonResponses,
  mapConfigId,
  customFieldId,
  projectId,
}: Props) => {
  const { formatMessage } = useIntl();

  const polygons = useMemo(() => {
    return polygonResponses.map(({ answer }) => answer);
  }, [polygonResponses]);

  const { data: customMapConfig, isLoading: isLoadingCustomMapConfig } =
    useMapConfigById(mapConfigId);
  const { data: projectMapConfig, isLoading: isLoadingProjectMapConfig } =
    useProjectMapConfig(projectId);

  const mapConfig = mapConfigId ? customMapConfig : projectMapConfig;

  const isLoading =
    (isLoadingCustomMapConfig && mapConfigId) || isLoadingProjectMapConfig;

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div>
      <PolygonMap
        polygons={polygons}
        mapConfig={mapConfig}
        layerTitle={formatMessage(surveyResultMessages.responses)}
        layerId={`responsesLayer_${customFieldId}`}
      />
    </div>
  );
};

export default PolygonLocationQuestion;
