import React, { useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import TopicFilterDropdown from './TopicFilterDropdown';
import SelectSort from './SortFilterDropdown';
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';
import IdeasView from './IdeasView';

// resources
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetIdeas, {
  Sort,
  GetIdeasChildProps,
  InputProps as GetIdeasInputProps,
} from 'resources/GetIdeas';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdeaCustomFieldsSchemas, {
  GetIdeaCustomFieldsSchemasChildProps,
} from 'resources/GetIdeaCustomFieldsSchemas';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';

// typings
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';
import { isFieldEnabled } from 'utils/projectUtils';

const Container = styled.div`
  width: 100%;
`;

const FiltersArea = styled.div`
  width: 100%;
  min-height: 54px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
  ${isRtl`
    flex-direction: row-reverse;
  `}
  &.mapView {
    justify-content: flex-end;
    margin-bottom: 15px;
    ${media.tablet`
      margin-bottom: 0px;
    `}
  }
  ${media.desktop`
    &.mapView {
      margin-top: -65px;
    }
  `}
  ${media.tablet`
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 30px;
  `}
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;
`;

const LeftFilterArea = styled(FilterArea)`
  flex: 1 1 auto;
  &.hidden {
    display: none;
  }
  ${media.tablet`
    display: flex;
    flex-direction: column;
    align-items: stretch;
  `}
`;

const RightFilterArea = styled(FilterArea)`
  display: flex;
  align-items: center;
  &.hidden {
    display: none;
  }
`;

const DropdownFilters = styled.div`
  display: flex;
  align-items: center;
  &.hidden {
    display: none;
  }
`;

const DesktopViewButtons = styled(ViewButtons)`
  margin-left: 40px;
  ${media.tablet`
    display: none;
  `}
`;

const MobileViewButtons = styled(ViewButtons)`
  margin-bottom: 15px;
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
  margin-right: 30px;
  ${isRtl`
    margin-right: 0;
    margin-left: auto;
  `}
  ${media.tablet`
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
    margin-bottom: 20px;
  `}
`;

interface InputProps extends GetIdeasInputProps {
  showViewToggle?: boolean | undefined;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  defaultView?: 'card' | 'map' | null | undefined;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
  allowProjectsFilter?: boolean;
  projectId?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  windowSize: GetWindowSizeChildProps;
  ideas: GetIdeasChildProps;
  project: GetProjectChildProps;
  ideaCustomFieldsSchemas: GetIdeaCustomFieldsSchemasChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeasWithoutFiltersSidebar = ({
  showViewToggle = false,
  defaultView,
  defaultSortingMethod,
  windowSize,
  ideas,
  className,
  allowProjectsFilter,
  project,
  ideaCustomFieldsSchemas,
  locale,
  participationMethod,
  participationContextId,
  participationContextType,
  projectId,
}: Props) => {
  const [selectedView, setSelectedView] = useState<'card' | 'map'>('card');

  useEffect(() => {
    setSelectedView(defaultView || 'card');
  }, [defaultView]);

  const handleSearchOnChange = (search: string) => {
    ideas.onChangeSearchTerm(search);
  };

  const handleProjectsOnChange = (projectIds: string[]) => {
    ideas.onChangeProjects(projectIds);
  };

  const handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });
    ideas.onChangeSorting(sort);
  };

  const handleTopicsOnChange = (topics: string[]) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });
    ideas.onChangeTopics(topics);
  };

  const selectView = (selectedView: 'card' | 'map') => {
    setSelectedView(selectedView);
  };

  const {
    list,
    hasMore,
    querying,
    queryParameters: { phase: phaseId },
  } = ideas;

  const locationEnabled = isFieldEnabled(
    'location_description',
    ideaCustomFieldsSchemas,
    locale
  );
  const topicsEnabled = isFieldEnabled(
    'topic_ids',
    ideaCustomFieldsSchemas,
    locale
  );
  const showViewButtons = !!(locationEnabled && showViewToggle);
  const showListView =
    !locationEnabled || (locationEnabled && selectedView === 'card');
  const showMapView = locationEnabled && selectedView === 'map';
  const smallerThanBigTablet = !!(
    windowSize && windowSize <= viewportWidths.tablet
  );
  const smallerThanSmallTablet = !!(
    windowSize && windowSize <= viewportWidths.tablet
  );
  const biggerThanSmallTablet = !!(
    windowSize && windowSize >= viewportWidths.tablet
  );
  const biggerThanLargeTablet = !!(
    windowSize && windowSize >= viewportWidths.tablet
  );
  const smallerThan1100px = !!(windowSize && windowSize <= 1100);
  const smallerThanPhone = !!(windowSize && windowSize <= viewportWidths.phone);

  if (list) {
    return (
      <Container
        id="e2e-ideas-container"
        className={`${className || ''} ${showMapView ? 'mapView' : 'listView'}`}
      >
        <FiltersArea
          id="e2e-ideas-filters"
          className={`ideasContainer ${showMapView ? 'mapView' : 'listView'}`}
        >
          <LeftFilterArea>
            {showViewButtons && smallerThanSmallTablet && (
              <MobileViewButtons
                selectedView={selectedView}
                onClick={selectView}
              />
            )}
            {!showMapView && (
              <StyledSearchInput
                className="e2e-search-ideas-input"
                onChange={handleSearchOnChange}
                a11y_numberOfSearchResults={list.length}
              />
            )}
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters
              className={`${showMapView ? 'hidden' : 'visible'} ${
                showViewButtons ? 'hasViewButtons' : ''
              }`}
            >
              <SelectSort
                onChange={handleSortOnChange}
                alignment={biggerThanLargeTablet ? 'right' : 'left'}
                defaultSortingMethod={defaultSortingMethod || null}
              />
              {allowProjectsFilter && (
                <ProjectFilterDropdown
                  title={<FormattedMessage {...messages.projectFilterTitle} />}
                  onChange={handleProjectsOnChange}
                />
              )}
              {topicsEnabled && !isNilOrError(project) && (
                <TopicFilterDropdown
                  onChange={handleTopicsOnChange}
                  alignment={biggerThanLargeTablet ? 'right' : 'left'}
                  projectId={project.id}
                />
              )}
            </DropdownFilters>

            {showViewButtons && !smallerThanSmallTablet && (
              <DesktopViewButtons
                selectedView={selectedView}
                onClick={selectView}
              />
            )}
          </RightFilterArea>
        </FiltersArea>
        <IdeasView
          list={list}
          querying={querying}
          onLoadMore={ideas.onLoadMore}
          hasMore={hasMore}
          loadingMore={querying}
          hideImage={smallerThanBigTablet && biggerThanSmallTablet}
          hideImagePlaceholder={smallerThanBigTablet}
          hideIdeaStatus={
            (biggerThanLargeTablet && smallerThan1100px) || smallerThanPhone
          }
          showListView={showListView}
          showMapView={showMapView}
          projectId={projectId}
          phaseId={phaseId || undefined}
          participationMethod={participationMethod}
          participationContextId={participationContextId}
          participationContextType={participationContextType}
        />
      </Container>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  windowSize: <GetWindowSize />,
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
  project: ({ render, projectId }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  ideaCustomFieldsSchemas: ({
    render,
    projectId,
    ideas: {
      queryParameters: { phase: phaseId },
    },
  }) => {
    return (
      <GetIdeaCustomFieldsSchemas
        projectId={projectId || null}
        phaseId={phaseId}
      >
        {render}
      </GetIdeaCustomFieldsSchemas>
    );
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <IdeasWithoutFiltersSidebar {...inputProps} {...dataProps} />
    )}
  </Data>
);
