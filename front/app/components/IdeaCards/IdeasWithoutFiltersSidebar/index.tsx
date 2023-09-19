import React, { useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useLocale from 'hooks/useLocale';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useProjectById from 'api/projects/useProjectById';
import useIdeaCustomFieldsSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

// router
import { useSearchParams } from 'react-router-dom';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// components
import TopicFilterDropdown from '../shared/Filters/TopicFilterDropdown';
import SelectSort, { Sort } from '../shared/Filters/SortFilterDropdown';
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';
import IdeasView from '../shared/IdeasView';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

// constants
import {
  ideaDefaultSortMethodFallback,
  IdeaDefaultSortMethod,
} from 'services/participationContexts';

// typings
import { isFieldEnabled } from 'utils/projectUtils';
import { IQueryParameters } from 'api/ideas/types';
import usePhase from 'api/phases/usePhase';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

const Container = styled.div`
  width: 100%;
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
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
  ${media.tablet`
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 8px;
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

export interface QueryParametersUpdate {
  search?: string;
  sort?: Sort;
  projects?: string[];
  topics?: string[];
}

export interface Props {
  ideaQueryParameters: IQueryParameters;
  onUpdateQuery: (newParams: QueryParametersUpdate) => void;

  // other
  projectId?: string;
  phaseId?: string;
  showViewToggle?: boolean | undefined;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  defaultView?: 'card' | 'map';
  className?: string;
  allowProjectsFilter?: boolean;
  showSearchbar: boolean;
  showDropdownFilters: boolean;
  goBackMode?: 'browserGoBackButton' | 'goToProject';
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
  showDropdownFilters,
  showSearchbar,
  goBackMode,
}: Props) => {
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const selectedIdeaMarkerId = searchParams.get('idea_map_id');
  const smallerThanTablet = useBreakpoint('tablet');
  const smallerThanPhone = useBreakpoint('phone');

  const { data: project } = useProjectById(projectId);

  const selectedView =
    (searchParams.get('view') as 'card' | 'map' | null) ??
    (selectedIdeaMarkerId ? 'map' : defaultView ?? 'card');

  const setSelectedView = useCallback((view: 'card' | 'map') => {
    updateSearchParams({ view });
  }, []);

  const { data: ideaCustomFieldsSchemas } = useIdeaCustomFieldsSchema({
    phaseId: ideaQueryParameters.phase,
    projectId,
  });

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteIdeas(ideaQueryParameters);
  const list = data?.pages.map((page) => page.data).flat();
  const { data: phase } = usePhase(phaseId);

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

    topics.length === 0
      ? onUpdateQuery({ topics: undefined })
      : onUpdateQuery({ topics });
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

  if (list) {
    return (
      <Container
        id="e2e-ideas-container"
        className={`${className || ''} ${
          selectedView === 'map' ? 'mapView' : 'listView'
        }`}
      >
        <FiltersArea
          id="e2e-ideas-filters"
          className={`ideasContainer ${
            selectedView === 'map' ? 'mapView' : 'listView'
          }`}
        >
          <LeftFilterArea>
            {showViewButtons && smallerThanTablet && (
              <MobileViewButtons
                selectedView={selectedView}
                onClick={setSelectedView}
              />
            )}
            {!(selectedView === 'map') && showSearchbar && (
              <StyledSearchInput
                defaultValue={ideaQueryParameters.search}
                className="e2e-search-ideas-input"
                onChange={handleSearchOnChange}
                a11y_numberOfSearchResults={list.length}
              />
            )}
          </LeftFilterArea>

          <RightFilterArea>
            {showDropdownFilters && (
              <DropdownFilters
                className={`${selectedView === 'map' ? 'hidden' : 'visible'} ${
                  showViewButtons ? 'hasViewButtons' : ''
                }`}
              >
                <SelectSort
                  value={defaultSortingMethod ?? ideaDefaultSortMethodFallback}
                  phase={phase?.data}
                  project={project?.data}
                  onChange={handleSortOnChange}
                  alignment={!smallerThanTablet ? 'right' : 'left'}
                />
                {allowProjectsFilter && (
                  <ProjectFilterDropdown
                    title={
                      <FormattedMessage {...messages.projectFilterTitle} />
                    }
                    onChange={handleProjectsOnChange}
                  />
                )}
                {topicsEnabled && !isNilOrError(project) && projectId && (
                  <TopicFilterDropdown
                    projectId={projectId}
                    selectedTopicIds={ideaQueryParameters.topics ?? []}
                    onChange={handleTopicsOnChange}
                    alignment={!smallerThanTablet ? 'right' : 'left'}
                  />
                )}
              </DropdownFilters>
            )}

            {showViewButtons && !smallerThanTablet && (
              <DesktopViewButtons
                selectedView={selectedView}
                onClick={setSelectedView}
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
          hideImage={false}
          hideImagePlaceholder={smallerThanPhone}
          hideIdeaStatus={smallerThanPhone}
          view={selectedView}
          projectId={projectId}
          phaseId={phaseId}
          goBackMode={goBackMode}
        />
      </Container>
    );
  }

  return null;
};

export default IdeasWithoutFiltersSidebar;
