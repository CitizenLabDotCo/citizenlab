import React, { useMemo } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import surveyResultMessages from 'components/admin/FormResults/messages';

import PointMap from 'components/admin/Graphs/PointMap';

import { useIntl } from 'utils/cl-intl';

interface Props {
  pointResponses: { answer: GeoJSON.Point }[];
  mapConfigId?: string;
  customFieldId: string;
  projectId: string;
  heatmap?: boolean;
}

const PointLocationQuestion = ({
  pointResponses,
  mapConfigId,
  customFieldId,
  projectId,
  heatmap,
}: Props) => {
  const { formatMessage } = useIntl();

  const points = useMemo(() => {
    return pointResponses.map(({ answer }) => answer);
  }, [pointResponses]);

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
      <PointMap
        points={points}
        mapConfig={mapConfig}
        layerTitle={formatMessage(surveyResultMessages.responses)}
        layerId={`responsesLayer_${customFieldId}`}
        heatmap={heatmap}
      />
    </div>
  );
};

export default PointLocationQuestion;
