import React, { useCallback } from 'react';

import {
  media,
  viewportWidths,
  defaultCardStyle,
  Spinner,
  useWindowSize,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaCustomFieldsSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { PresentationMode, IdeaSortMethod, InputTerm } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import { QueryParameters } from 'containers/IdeasIndexPage';

import ViewButtons from 'components/PostCardsComponents/ViewButtons';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { getInputTermMessage } from 'utils/i18n';
import { isFieldEnabled } from 'utils/projectUtils';

import messages from '../messages';
import IdeasView from '../shared/IdeasView';
import tracks from '../tracks';

import ButtonWithFiltersModal from './ButtonWithFiltersModal';
import ContentRight from './ContentRight';

export const gapWidth = 35;

const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const InitialLoading = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};

  ${media.phone`
    height: 150px;
  `}
`;

const ContentLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
`;

export interface QueryParametersUpdate {
  sort?: IdeaSortMethod;
  search?: string;
  idea_status?: string;
  topics?: string[];
}

export interface Props {
  ideaQueryParameters: QueryParameters;
  onUpdateQuery: (newParams: QueryParametersUpdate) => void;
  showViewToggle?: boolean;
  defaultView?: PresentationMode;
  projectId?: string;
  phaseId?: string;
  inputTerm?: InputTerm;
}

const IdeasWithFiltersSidebar = ({
  ideaQueryParameters,
  projectId,
  phaseId,
  defaultView,
  onUpdateQuery,
  showViewToggle,
  inputTerm,
}: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const { windowWidth } = useWindowSize();
  const [searchParams] = useSearchParams();
  const selectedIdeaMarkerId = searchParams.get('idea_map_id');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteIdeas(ideaQueryParameters);

  const list = data?.pages.map((page) => page.data).flat();
  const { data: ideasFilterCounts } = useIdeasFilterCounts(ideaQueryParameters);

  const selectedView =
    (searchParams.get('view') as 'card' | 'map' | null) ??
    (selectedIdeaMarkerId ? 'map' : defaultView ?? 'card');

  const { data: ideaCustomFieldsSchemas } = useIdeaCustomFieldsSchema({
    phaseId: ideaQueryParameters.phase,
    projectId,
  });

  const locationEnabled = !isNilOrError(ideaCustomFieldsSchemas)
    ? isFieldEnabled(
        'location_description',
        ideaCustomFieldsSchemas.data.attributes,
        locale
      )
    : false;

  const showViewButtons = !!(locationEnabled && showViewToggle);

  const setSelectedView = useCallback((view: 'card' | 'map') => {
    updateSearchParams({ view });
  }, []);

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

  const handleSortOnChange = useCallback(
    (sort: IdeaSortMethod) => {
      trackEventByName(tracks.sortingFilter, {
        sort,
      });

      onUpdateQuery({ sort });
    },
    [onUpdateQuery]
  );

  const handleStatusOnChange = useCallback(
    (idea_status: string | null) => {
      onUpdateQuery({ idea_status: idea_status ?? undefined });
    },
    [onUpdateQuery]
  );

  const handleTopicsOnChange = useCallback(
    (topics: string[] | null) => {
      onUpdateQuery({ topics: topics ?? undefined });
    },
    [onUpdateQuery]
  );

  const clearFilters = useCallback(() => {
    onUpdateQuery({
      search: undefined,
      idea_status: undefined,
      topics: undefined,
    });
  }, [onUpdateQuery]);

  const filterColumnWidth = windowWidth && windowWidth < 1400 ? 340 : 352;
  const filtersActive = !!(
    ideaQueryParameters.search ||
    ideaQueryParameters.idea_status ||
    ideaQueryParameters.topics
  );
  const biggerThanLargeTablet = !!(
    windowWidth && windowWidth >= viewportWidths.tablet
  );
  const smallerThanPhone = !!(
    windowWidth && windowWidth <= viewportWidths.phone
  );
  const showContentRight = biggerThanLargeTablet && selectedView === 'card';

  return (
    <Container id="e2e-ideas-container">
      <Box display="flex" justifyContent="space-between" mb="8px">
        {inputTerm ? (
          <Title variant="h4" as="h2" mt="auto" mb="auto" color="tenantText">
            {formatMessage(messages.ideasFilterSidebarTitle, {
              numberIdeas: list ? list.length : 0,
              inputTerm: formatMessage(
                getInputTermMessage(inputTerm, {
                  idea: messages.ideas,
                  option: messages.options,
                  project: messages.projects,
                  question: messages.questions,
                  issue: messages.issues,
                  contribution: messages.contributions,
                  proposal: messages.proposals,
                  initiative: messages.initiatives,
                  petition: messages.petitions,
                })
              ),
            })}
          </Title>
        ) : (
          <Text m="0px">
            {formatMessage(messages.numberResults, {
              postCount: list ? list.length : 0,
            })}
          </Text>
        )}

        {showViewButtons && (
          <ViewButtons selectedView={selectedView} onClick={setSelectedView} />
        )}
      </Box>

      {list === undefined && (
        <InitialLoading id="ideas-loading">
          <Spinner />
        </InitialLoading>
      )}

      {list && (
        <>
          <ButtonWithFiltersModal
            selectedIdeaFilters={ideaQueryParameters}
            filtersActive={filtersActive}
            ideasFilterCounts={ideasFilterCounts}
            numberOfSearchResults={list.length}
            onClearFilters={clearFilters}
            onSearch={handleSearchOnChange}
            onChangeStatus={handleStatusOnChange}
            onChangeTopics={handleTopicsOnChange}
            handleSortOnChange={handleSortOnChange}
          />
          <Box display={selectedView === 'map' ? 'block' : 'flex'}>
            <ContentLeft>
              <IdeasView
                list={list}
                querying={isLoading}
                onLoadMore={fetchNextPage}
                hasMore={!!hasNextPage}
                loadingMore={isFetchingNextPage}
                hideImagePlaceholder={true}
                hideImage={false}
                hideIdeaStatus={smallerThanPhone}
                view={selectedView}
                hasMoreThanOneView={false}
                projectId={projectId}
                hasFilterSidebar={true}
                phaseId={phaseId}
                ideaMarkers={ideaMarkers}
                inputFiltersProps={{
                  filtersActive,
                  ideasFilterCounts,
                  numberOfSearchResults: list.length,
                  selectedIdeaFilters: ideaQueryParameters,
                  onClearFilters: clearFilters,
                  onSearch: handleSearchOnChange,
                  onChangeStatus: handleStatusOnChange,
                  onChangeTopics: handleTopicsOnChange,
                  handleSortOnChange,
                }}
              />
            </ContentLeft>

            {showContentRight && (
              <ContentRight
                ideaQueryParameters={ideaQueryParameters}
                filterColumnWidth={filterColumnWidth}
                filtersActive={filtersActive}
                ideasFilterCounts={ideasFilterCounts}
                numberOfSearchResults={list.length}
                onClearFilters={clearFilters}
                onSearch={handleSearchOnChange}
                onChangeStatus={handleStatusOnChange}
                onChangeTopics={handleTopicsOnChange}
                onChangeSort={handleSortOnChange}
              />
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default IdeasWithFiltersSidebar;
