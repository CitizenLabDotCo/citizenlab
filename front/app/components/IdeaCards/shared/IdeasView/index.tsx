import React from 'react';
import IdeasList from './IdeasList';
import IdeasMap from 'components/IdeasMap';
import { IIdeaData } from 'api/ideas/types';
import { IdeaDefaultSortMethod } from 'api/phases/types';
import { Box } from '@citizenlab/cl2-component-library';
import useMapConfig from 'api/map_config/useMapConfig';

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
  onLoadMore,
}: Props) => {
  const { data: mapConfig } = useMapConfig(projectId);

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
            ideasList={list}
            mapConfig={mapConfig}
          />
        </Box>
      )}
    </>
  );
};

export default IdeasView;
