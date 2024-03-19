import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IIdeaMarkers } from 'api/idea_markers/types';
import { IIdeaData } from 'api/ideas/types';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import { IdeaDefaultSortMethod } from 'api/phases/types';

import IdeasMap from 'components/IdeasMap';

import IdeasList from './IdeasList';

interface Props {
  view: 'card' | 'map';
  defaultSortingMethod?: IdeaDefaultSortMethod;
  hideImage: boolean;
  hideImagePlaceholder: boolean;
  hideIdeaStatus: boolean;
  projectId?: string;
  phaseId?: string;
  list: IIdeaData[];
  querying: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  ideaMarkers?: IIdeaMarkers;
  onLoadMore(): void;
}

const IdeasView = ({
  view,
  hideImage,
  hideImagePlaceholder,
  hideIdeaStatus,
  projectId,
  phaseId,
  list,
  querying,
  hasMore,
  loadingMore,
  ideaMarkers,
  onLoadMore,
}: Props) => {
  const { data: mapConfig, isLoading } = useProjectMapConfig(
    projectId || undefined
  );

  if (projectId && isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {view === 'card' && list && (
        <IdeasList
          ariaLabelledBy={'view-tab-1'}
          id={'view-panel-1'}
          querying={querying}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          hasIdeas={list.length > 0}
          loadingMore={loadingMore}
          list={list}
          tabIndex={0}
          hideImage={hideImage}
          hideImagePlaceholder={hideImagePlaceholder}
          hideIdeaStatus={hideIdeaStatus}
          phaseId={phaseId}
        />
      )}
      {view === 'map' && projectId && (
        <Box aria-label={'view-tab-2'} id={'view-panel-2'}>
          <IdeasMap
            projectId={projectId}
            phaseId={phaseId}
            mapConfig={mapConfig}
            ideaMarkers={ideaMarkers}
          />
        </Box>
      )}
    </>
  );
};

export default IdeasView;
