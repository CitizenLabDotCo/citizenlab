import React from 'react';
import { adopt } from 'react-adopt';
import IdeasList from './IdeasList';
import IdeasMap from 'components/IdeasMap';
import GetIdeas, {
  GetIdeasChildProps,
  InputProps as GetIdeasInputProps,
} from 'resources/GetIdeas';
import { isNilOrError } from 'utils/helperUtils';
import {
  ideaDefaultSortMethodFallback,
  IdeaDefaultSortMethod,
  ParticipationMethod,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

interface DataProps {
  ideas: GetIdeasChildProps;
}

interface InputProps extends GetIdeasInputProps {
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
}

interface Props extends DataProps, InputProps {}

const IdeasView = ({
  showListView,
  showMapView,
  ideas,
  participationContextId,
  participationContextType,
  participationMethod,
  hideImage,
  hideImagePlaceholder,
  hideIdeaStatus,
  projectId,
}: Props) => {
  if (!isNilOrError(ideas)) {
    const { list, querying, hasMore, loadingMore } = ideas;
    return (
      <>
        {showListView && list && (
          <IdeasList
            ariaLabelledBy={'view-tab-1'}
            id={'view-panel-1'}
            querying={querying}
            onLoadMore={ideas.onLoadMore}
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
        {showMapView && (
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
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  ideas: ({ render, projectId, ...getIdeasInputProps }) => (
    <GetIdeas
      {...getIdeasInputProps}
      projectIds={projectId ? [projectId] : 'all'}
      pageSize={24}
      sort={
        getIdeasInputProps.defaultSortingMethod || ideaDefaultSortMethodFallback
      }
    >
      {render}
    </GetIdeas>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => <IdeasView {...inputProps} {...dataProps} />}
  </Data>
);
