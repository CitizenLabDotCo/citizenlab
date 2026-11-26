import React from 'react';

import Spinner from 'design-system/Spinner';

import { QueryParameters } from 'api/idea_markers/types';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';

import IdeasMap from 'components/IdeasMap';

import ListLoadError from '../Phase/ListLoadError';

interface Props {
  projectId: string;
  filters: QueryParameters;
  selectedIdeaId: string | undefined;
  onSelectIdea: (ideaId: string | null) => void;
}

const ManagedInputsMap = ({
  projectId,
  filters,
  selectedIdeaId,
  onSelectIdea,
}: Props) => {
  const markers = useIdeaMarkers(filters);
  const config = useProjectMapConfig(projectId);

  if (markers.isError) {
    return <ListLoadError onRetry={() => markers.refetch()} />;
  }

  if (markers.isLoading || config.isLoading) return <Spinner />;

  return (
    <IdeasMap
      projectId={projectId}
      phaseId={filters.phaseId ?? undefined}
      mapConfig={config.data}
      ideaMarkers={markers.data}
      management={{ selectedIdeaId, onSelectIdea }}
    />
  );
};

export default ManagedInputsMap;
