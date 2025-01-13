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
import { IIdeaQueryParameters } from 'api/ideas/types';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import { IdeaSortMethod } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import { IdeaSortMethodFallback } from 'api/phases/utils';
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
import SelectSort from '../shared/Filters/SortFilterDropdown';
import StatusFilterDropdown from '../shared/Filters/StatusFilterDropdown';
import TopicFilterDropdown from '../shared/Filters/TopicFilterDropdown';
import IdeasView from '../shared/IdeasView';
import tracks from '../tracks';

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  gap: 12px;

  ${isRtl`
    flex-direction: column-reverse;
  `}

  ${media.tablet`
    margin-bottom: 8px;
  `}
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
  margin-right: 30px;
  flex-shrink: 0;

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
  sort?: IdeaSortMethod;
  projects?: string[];
  topics?: string[];
  idea_status?: string;
}

export interface Props {
  ideaQueryParameters: IIdeaQueryParameters;
  onUpdateQuery: (newParams: QueryParametersUpdate) => void;

  // other
  projectId?: string;
  phaseId?: string;
  showViewToggle?: boolean | undefined;
  defaultSortingMethod?: IdeaSortMethod;
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
  const locationEnabled = !isNilOrError(ideaCustomFieldsSchemas)
    ? isFieldEnabled(
        'location_description',
        ideaCustomFieldsSchemas.data.attributes,
        locale
      )
    : false;
  const loadIdeaMarkers = locationEnabled && selectedView === 'map';
  const { data: ideaMarkers } = useIdeaMarkers(
    {
      projectIds: projectId ? [projectId] : null,
      phaseId,
      ...ideaQueryParameters,
    },
    loadIdeaMarkers
  );

  const handleSearchOnChange = useCallback(
    (search: string) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      onUpdateQuery({ search: search ?? undefined });
    },
    [onUpdateQuery]
  );

  const handleProjectsOnChange = (projects: string[]) => {
    onUpdateQuery({ projects });
  };

  const handleSortOnChange = (sort: IdeaSortMethod) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });

    onUpdateQuery({ sort });
  };

  const handleTopicsOnChange = (topics: string[]) => {
    trackEventByName(tracks.topicsFilter, {
      topics: topics.toString(),
    });

    topics.length === 0
      ? onUpdateQuery({ topics: undefined })
      : onUpdateQuery({ topics });
  };

  const handleStatusChange = (idea_status: string) => {
    trackEventByName(tracks.statusesFilter, {
      idea_status,
    });

    onUpdateQuery({ idea_status });
  };

  const topicsEnabled = !isNilOrError(ideaCustomFieldsSchemas)
    ? isFieldEnabled(
        'topic_ids',
        ideaCustomFieldsSchemas.data.attributes,
        locale
      )
    : false;

  const showViewButtons = !!(locationEnabled && showViewToggle);
  const showSearch = !(selectedView === 'map') && showSearchbar;
  const participationMethod = phase?.data.attributes.participation_method;

  if (isLoading) return <Spinner />;

  if (list) {
    return (
      <Box id="e2e-ideas-container" className={`${className || ''}`}>
        <FiltersArea id="e2e-ideas-filters" className="ideasContainer">
          <Box display="flex" justifyContent="flex-end">
            {showViewButtons && (
              <ViewButtons
                selectedView={selectedView}
                onClick={setSelectedView}
              />
            )}
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="12px"
          >
            {showSearch && (
              <StyledSearchInput
                defaultValue={ideaQueryParameters.search}
                className="e2e-search-ideas-input"
                onChange={handleSearchOnChange}
                a11y_numberOfSearchResults={list.length}
              />
            )}
            {showDropdownFilters && (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                w={showSearch ? 'auto' : '100%'}
              >
                <SelectSort
                  value={defaultSortingMethod ?? IdeaSortMethodFallback}
                  phase={phase?.data}
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
                    alignment={smallerThanTablet ? 'right' : 'left'}
                  />
                )}
                {(participationMethod === 'proposals' ||
                  participationMethod === 'ideation') && (
                  <StatusFilterDropdown
                    selectedStatusIds={
                      ideaQueryParameters.idea_status
                        ? [ideaQueryParameters.idea_status]
                        : []
                    }
                    onChange={(statuses) => handleStatusChange(statuses[0])}
                    alignment={smallerThanTablet ? 'right' : 'left'}
                    participationMethod={participationMethod}
                    isScreeningEnabled={
                      phase?.data.attributes.prescreening_enabled
                    }
                  />
                )}
              </Box>
            )}
          </Box>
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
