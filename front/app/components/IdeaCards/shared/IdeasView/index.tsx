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
  // This prop is used to set the aria-labelledby attribute. Set this to false if only one view is shown all the time. That is when the tabs are hidden.
  hasMoreThanOneView?: boolean;
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
  hasMoreThanOneView = true,
}: Props) => {
  const { data: mapConfig, isLoading } = useProjectMapConfig(
    projectId || undefined
  );

  if (projectId && isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {/* TODO: Fix this the next time the file is edited. */}
      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
      {view === 'card' && list && (
        <IdeasList
          ariaLabelledBy={hasMoreThanOneView ? 'view-tab-1' : undefined}
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
