import React, { useState, useEffect, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useLocale from 'hooks/useLocale';
import { useWindowSize } from '@citizenlab/cl2-component-library';
import useProject from 'hooks/useProject';
import useIdeaCustomFieldsSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// components
import TopicFilterDropdown from '../shared/Filters/TopicFilterDropdown';
import SelectSort from '../shared/Filters/SortFilterDropdown';
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';
import IdeasView from '../shared/IdeasView';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';

// typings
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';
import { isFieldEnabled } from 'utils/projectUtils';
import { IQueryParameters, Sort } from 'api/ideas/types';
import usePhase from 'hooks/usePhase';

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

export interface Props {
  ideaQueryParameters: IQueryParameters;
  onUpdateQuery: (newParams: Partial<IQueryParameters>) => void;

  // other
  projectId?: string;
  phaseId?: string;
  showViewToggle?: boolean | undefined;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  defaultView?: 'card' | 'map' | null | undefined;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
  allowProjectsFilter?: boolean;
}

const IdeasWithoutFiltersSidebar = ({
  ideaQueryParameters,
  onUpdateQuery,
  projectId,
  phaseId,
  showViewToggle = false,
  defaultView,
  defaultSortingMethod,
  className,
  allowProjectsFilter,
  participationMethod,
  participationContextId,
  participationContextType,
}: Props) => {
  const locale = useLocale();
  const { windowWidth } = useWindowSize();
  const project = useProject({ projectId });

  const [selectedView, setSelectedView] = useState<'card' | 'map'>('card');
  const { data: ideaCustomFieldsSchemas } = useIdeaCustomFieldsSchema({
    phaseId: ideaQueryParameters.phase,
    projectId,
  });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteIdeas(ideaQueryParameters);
  const list = data?.pages.map((page) => page.data).flat();
  const phase = usePhase(phaseId ? phaseId : null);

  useEffect(() => {
    setSelectedView(defaultView || 'card');
  }, [defaultView]);

  const handleSearchOnChange = useCallback(
    (search: string) => {
      onUpdateQuery({ search: search ?? undefined });
    },
    [onUpdateQuery]
  );

  const handleProjectsOnChange = (projects: string[]) => {
    onUpdateQuery({ projects });
  };

  const handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });

    onUpdateQuery({ sort });
  };

  const handleTopicsOnChange = (topics: string[]) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });

    onUpdateQuery({ topics });
  };

  const selectView = (selectedView: 'card' | 'map') => {
    setSelectedView(selectedView);
  };

  const locationEnabled = !isNilOrError(ideaCustomFieldsSchemas)
    ? isFieldEnabled(
        'location_description',
        ideaCustomFieldsSchemas.data.attributes,
        locale
      )
    : false;

  const topicsEnabled = !isNilOrError(ideaCustomFieldsSchemas)
    ? isFieldEnabled(
        'topic_ids',
        ideaCustomFieldsSchemas.data.attributes,
        locale
      )
    : false;
  const showViewButtons = !!(locationEnabled && showViewToggle);
  const showListView =
    !locationEnabled || (locationEnabled && selectedView === 'card');
  const showMapView = locationEnabled && selectedView === 'map';
  const smallerThanBigTablet = !!(
    windowWidth && windowWidth <= viewportWidths.tablet
  );
  const smallerThanSmallTablet = !!(
    windowWidth && windowWidth <= viewportWidths.tablet
  );
  const biggerThanSmallTablet = !!(
    windowWidth && windowWidth >= viewportWidths.tablet
  );
  const biggerThanLargeTablet = !!(
    windowWidth && windowWidth >= viewportWidths.tablet
  );
  const smallerThan1100px = !!(windowWidth && windowWidth <= 1100);
  const smallerThanPhone = !!(
    windowWidth && windowWidth <= viewportWidths.phone
  );

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
                phase={phase}
                project={project}
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
          querying={isLoading}
          onLoadMore={fetchNextPage}
          hasMore={!!hasNextPage}
          loadingMore={isFetchingNextPage}
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

export default IdeasWithoutFiltersSidebar;
