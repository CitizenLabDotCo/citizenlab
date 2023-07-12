import React from 'react';
import IdeasList from './IdeasList';
import IdeasMap from 'components/IdeasMap';
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
} from 'services/participationContexts';
import { IIdeaData } from 'api/ideas/types';

interface Props {
  view: 'card' | 'map';
  defaultSortingMethod?: IdeaDefaultSortMethod;
  participationMethod?: ParticipationMethod | null;
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
  goBackMode?: 'browserGoBackButton' | 'goToProject';
}

const IdeasView = ({
  view,
  participationMethod,
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
  goBackMode,
}: Props) => {
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
          participationMethod={participationMethod}
          tabIndex={0}
          hideImage={hideImage}
          hideImagePlaceholder={hideImagePlaceholder}
          hideIdeaStatus={hideIdeaStatus}
          goBackMode={goBackMode}
          phaseId={phaseId}
        />
      )}
      {/*
        IdeasMap is only used in projects at the moment,
        so I narrowed down the projectId type.
      */}
      {view === 'map' && projectId && (
        <IdeasMap
          ariaLabelledBy={'view-tab-2'}
          id={'view-panel-2'}
          projectId={projectId}
          phaseId={phaseId}
          tabIndex={0}
        />
      )}
    </>
  );
};

export default IdeasView;
