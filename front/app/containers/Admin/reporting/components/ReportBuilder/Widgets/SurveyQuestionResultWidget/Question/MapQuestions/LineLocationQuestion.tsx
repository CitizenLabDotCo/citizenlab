import React, { useMemo } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useMapConfigById from 'api/map_config/useMapConfigById';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import surveyResultMessages from 'components/admin/FormResults/messages';

import LineMap from 'components/admin/Graphs/LineMap';

import { useIntl } from 'utils/cl-intl';

interface Props {
  lineResponses: { answer: GeoJSON.LineString }[];
  mapConfigId?: string;
  customFieldId: string;
  projectId: string;
}

const LineLocationQuestion = ({
  lineResponses,
  mapConfigId,
  customFieldId,
  projectId,
}: Props) => {
  const { formatMessage } = useIntl();

  const lines = useMemo(() => {
    return lineResponses.map(({ answer }) => answer);
  }, [lineResponses]);

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
      <LineMap
        lines={lines}
        mapConfig={mapConfig}
        layerTitle={formatMessage(surveyResultMessages.responses)}
        layerId={`responsesLayer_${customFieldId}`}
      />
    </div>
  );
};

export default LineLocationQuestion;
