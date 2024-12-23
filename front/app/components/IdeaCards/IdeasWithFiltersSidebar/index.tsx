import React, { useCallback } from 'react';

import {
  media,
  defaultCardStyle,
  Spinner,
  Box,
  Title,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaCustomFieldsSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import { IdeaQueryParameters } from 'api/ideas/types';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { PresentationMode, IdeaSortMethod, InputTerm } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import ViewButtons from 'components/PostCardsComponents/ViewButtons';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { isFieldEnabled } from 'utils/projectUtils';

import messages from '../messages';
import IdeasView from '../shared/IdeasView';
import tracks from '../tracks';

import ButtonWithFiltersModal from './ButtonWithFiltersModal';
import ContentRight from './ContentRight';
import { InputFiltersProps } from './InputFilters';
import { getInputCountMessage } from './utils';

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
  ideaQueryParameters: IdeaQueryParameters;
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
  defaultView = 'card',
  onUpdateQuery,
  showViewToggle,
  inputTerm,
}: Props) => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const smallerThanPhone = useBreakpoint('phone');
  const biggerThanLargeTablet = !useBreakpoint('tablet');

  // Get data from searchParams
  const selectedIdeaMarkerId = searchParams.get('idea_map_id');
  const selectedView =
    (searchParams.get('view') as PresentationMode | null) ??
    (selectedIdeaMarkerId ? 'map' : defaultView);

  // Fetch ideas list & filter counts
  const {
    data,
    isLoading,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteIdeas(ideaQueryParameters);

  const list = data?.pages.map((page) => page.data).flat();
  const { data: ideasFilterCounts } = useIdeasFilterCounts(ideaQueryParameters);
  const ideasCount = ideasFilterCounts?.data.attributes.total || 0;

  // Determine if location field enabled (for view button visibility and fetching idea markers)
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
  const loadIdeaMarkers = locationEnabled && selectedView === 'map';
  const { data: ideaMarkers } = useIdeaMarkers(
    {
      projectIds: projectId ? [projectId] : null,
      phaseId,
      ...ideaQueryParameters,
    },
    loadIdeaMarkers
  );

  const setSelectedView = useCallback((view: PresentationMode) => {
    updateSearchParams({ view });
  }, []);

  const handleSearchOnChange = useCallback(
    (search: string | null) => {
      trackEventByName(tracks.searchFilterUsedIdeas);
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
      trackEventByName(tracks.statusesFilter, {
        idea_status,
      });
      onUpdateQuery({ idea_status: idea_status ?? undefined });
    },
    [onUpdateQuery]
  );

  const handleTopicsOnChange = useCallback(
    (topics: string[] | null) => {
      trackEventByName(tracks.topicsFilter, {
        topics: topics?.toString(),
      });

      onUpdateQuery({ topics: topics ?? undefined });
    },
    [onUpdateQuery]
  );

  const showInputFilterSidebar =
    biggerThanLargeTablet && selectedView === 'card';

  const inputFiltersProps: InputFiltersProps = {
    ideasFilterCounts,
    numberOfSearchResults: ideasCount,
    ideaQueryParameters,
    onSearch: handleSearchOnChange,
    onChangeStatus: handleStatusOnChange,
    onChangeTopics: handleTopicsOnChange,
    handleSortOnChange,
    phaseId,
  };

  return (
    <Container id="e2e-ideas-container">
      <Box
        display="flex"
        justifyContent="space-between"
        mb={showViewButtons ? '8px' : '16px'}
      >
        {inputTerm && (
          <Title
            variant="h5"
            as="h2"
            my="auto"
            color="tenantText"
            fontWeight="semi-bold"
          >
            {formatMessage(getInputCountMessage(inputTerm), {
              ideasCount,
            })}
          </Title>
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
          <ButtonWithFiltersModal {...inputFiltersProps} />
          {/* 
            If we have an inputTerm (are on the project page), we don't need this because the number of results is displayed next to the heading (see above). This fallback is used on the /ideas page, where we have no inputTerm. 
            TO DO: refactor this component so we can add it to the page instead to this general component.
          */}
          {!inputTerm && (
            <Text mb="8px">
              {formatMessage(messages.numberResults, {
                postCount: ideasCount,
              })}
            </Text>
          )}
          <Box display={selectedView === 'map' ? 'block' : 'flex'}>
            <ContentLeft>
              {isFetching && (
                <Box mb="12px">
                  <Spinner />
                </Box>
              )}
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
                inputFiltersProps={inputFiltersProps}
              />
            </ContentLeft>

            {showInputFilterSidebar && <ContentRight {...inputFiltersProps} />}
          </Box>
        </>
      )}
    </Container>
  );
};

export default IdeasWithFiltersSidebar;
