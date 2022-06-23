import React from 'react';
import IdeasList from './IdeasList';
import IdeasMap from 'components/IdeasMap';
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';
import { IIdeaData } from 'services/ideas';

interface Props {
  showListView: boolean;
  showMapView: boolean;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
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
  showListView,
  showMapView,
  participationContextId,
  participationContextType,
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
}: Props) => {
  return (
    <>
      {showListView && list && (
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
          participationContextId={participationContextId}
          participationContextType={participationContextType}
          tabIndex={0}
          hideImage={hideImage}
          hideImagePlaceholder={hideImagePlaceholder}
          hideIdeaStatus={hideIdeaStatus}
        />
      )}
      {/*
        IdeasMap is only used in projects at the moment,
        so I narrowed down the projectId type.
      */}
      {showMapView && projectId && (
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
