import React, { useMemo } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import surveyResultMessages from 'components/admin/FormResults/messages';
import PointMap from 'components/admin/Graphs/PointMap';

import { useIntl } from 'utils/cl-intl';

interface Props {
  multipointResponses: { answer: GeoJSON.MultiPoint }[];
  mapConfigId?: string;
  customFieldId: string;
  projectId: string;
  heatmap?: boolean;
}

const MultipointLocationQuestion = ({
  multipointResponses,
  mapConfigId,
  customFieldId,
  projectId,
  heatmap,
}: Props) => {
  const { formatMessage } = useIntl();

  // Every pin is plotted on its own, so pins from one respondent are not grouped.
  // The GeoJSON export keeps the per-response grouping.
  const points: GeoJSON.Point[] = useMemo(() => {
    return multipointResponses.flatMap(({ answer }) =>
      answer.coordinates.map((coordinates) => ({
        type: 'Point' as const,
        coordinates,
      }))
    );
  }, [multipointResponses]);

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

export default MultipointLocationQuestion;
