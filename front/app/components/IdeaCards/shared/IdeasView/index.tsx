import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IIdeaMarkers } from 'api/idea_markers/types';
import { IIdeaData } from 'api/ideas/types';
import useProjectMapConfig from 'api/map_config/useProjectMapConfig';
import { IdeaSortMethod } from 'api/phases/types';

import StickyNotesPile from 'containers/IdeasFeedPage/StickyNotes/StickyNotesPile';

import IdeasMap from 'components/IdeasMap';

import { InputFiltersProps } from '../../IdeasWithFiltersSidebar/InputFilters';

import IdeasList from './IdeasList';

interface Props {
  view: 'card' | 'map' | 'feed';
  // This prop is used to set the aria-labelledby attribute. Set this to false if only one view is shown all the time. That is when the tabs are hidden.
  hasMoreThanOneView?: boolean;
  defaultSortingMethod?: IdeaSortMethod;
  hideImage: boolean;
  hideImagePlaceholder: boolean;
  hideIdeaStatus: boolean;
  projectId?: string;
  phaseId?: string;
  projectSlug?: string;
  list: IIdeaData[];
  querying: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  ideaMarkers?: IIdeaMarkers;
  onLoadMore(): void;
  inputFiltersProps?: InputFiltersProps;
  hasFilterSidebar?: boolean;
}

const IdeasView = ({
  view,
  hideImage,
  hideImagePlaceholder,
  hideIdeaStatus,
  projectId,
  phaseId,
  projectSlug,
  list,
  querying,
  hasMore,
  loadingMore,
  ideaMarkers,
  onLoadMore,
  hasMoreThanOneView = true,
  hasFilterSidebar = false,
  inputFiltersProps,
}: Props) => {
  const { data: mapConfig, isLoading } = useProjectMapConfig(
    projectId || undefined
  );

  if (projectId && isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {view === 'card' && (
        <IdeasList
          ariaLabelledBy={hasMoreThanOneView ? 'view-tab-1' : undefined}
          id={'view-panel-1'}
          querying={querying}
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          hasIdeas={list.length > 0}
          loadingMore={loadingMore}
          list={list}
          hideImage={hideImage}
          hideImagePlaceholder={hideImagePlaceholder}
          hideIdeaStatus={hideIdeaStatus}
          phaseId={phaseId}
          hasFilterSidebar={hasFilterSidebar}
        />
      )}
      {view === 'map' && projectId && (
        <Box aria-label={'view-tab-2'} id={'view-panel-2'}>
          <IdeasMap
            projectId={projectId}
            phaseId={phaseId}
            mapConfig={mapConfig}
            ideaMarkers={ideaMarkers}
            inputFiltersProps={inputFiltersProps}
          />
        </Box>
      )}
      {view === 'feed' && phaseId && projectSlug && (
        <Box aria-label={'view-tab-3'} id={'view-panel-3'}>
          <StickyNotesPile phaseId={phaseId} slug={projectSlug} />
        </Box>
      )}
    </>
  );
};

export default IdeasView;
