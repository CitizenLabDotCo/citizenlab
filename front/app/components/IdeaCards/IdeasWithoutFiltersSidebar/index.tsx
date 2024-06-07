import React, { useCallback, useMemo } from 'react';

import {
  Spinner,
  useBreakpoint,
  media,
  isRtl,
  Box,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaCustomFieldsSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import { IQueryParameters } from 'api/ideas/types';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import { IdeaDefaultSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import { ideaDefaultSortMethodFallback } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocale from 'hooks/useLocale';

import ViewButtons from 'components/PostCardsComponents/ViewButtons';
import ProjectFilterDropdown from 'components/ProjectFilterDropdown';
import SearchInput from 'components/UI/SearchInput';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { isFieldEnabled } from 'utils/projectUtils';

import messages from '../messages';
import SelectSort, { Sort } from '../shared/Filters/SortFilterDropdown';
import TopicFilterDropdown from '../shared/Filters/TopicFilterDropdown';
import IdeasView from '../shared/IdeasView';
import tracks from '../tracks';

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 12px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-bottom: 8px;
  `}
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
  margin-right: 30px;
  flex-shrink: 0; /* Prevent the search input from shrinking */

  ${isRtl`
    margin-right: 0;
    margin-left: auto;
  `}

  ${media.phone`
    width: 100%;
    margin-right: 0px;
    margin-left: 0px;
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
  const list = useMemo(() => {
    return data?.pages.map((page) => page.data).flat();
  }, [data?.pages]);
  const { data: phase } = usePhase(phaseId);
  const { data: ideaMarkers } = useIdeaMarkers({
    projectIds: projectId ? [projectId] : null,
    phaseId,
    ...ideaQueryParameters,
  });

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

  if (isLoading) return <Spinner />;

  if (list) {
    return (
      <Box id="e2e-ideas-container" className={`${className || ''}`}>
        <FiltersArea id="e2e-ideas-filters" className="ideasContainer">
          {showSearchbar && (
            <StyledSearchInput
              defaultValue={ideaQueryParameters.search}
              className="e2e-search-ideas-input"
              onChange={handleSearchOnChange}
              a11y_numberOfSearchResults={list.length}
            />
          )}
          {showDropdownFilters && (
            <Box display="flex" alignItems="center">
              <SelectSort
                value={defaultSortingMethod ?? ideaDefaultSortMethodFallback}
                phase={phase?.data}
                onChange={handleSortOnChange}
                alignment={!smallerThanTablet ? 'right' : 'left'}
              />
              {allowProjectsFilter && (
                <ProjectFilterDropdown
                  title={<FormattedMessage {...messages.projectFilterTitle} />}
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
            </Box>
          )}
          {showViewButtons && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent={smallerThanPhone ? 'flex-start' : undefined}
            >
              <ViewButtons
                selectedView={selectedView}
                onClick={setSelectedView}
              />
            </Box>
          )}
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
          ideaMarkers={ideaMarkers}
        />
      </Box>
    );
  }

  return null;
};

export default IdeasWithoutFiltersSidebar;
