import React, { useCallback, useEffect, useState } from 'react';

import {
  media,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
  isRtl,
  Spinner,
  useWindowSize,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useIdeaCustomFieldsSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaMarkers from 'api/idea_markers/useIdeaMarkers';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { PresentationMode } from 'api/phases/types';

import useLocale from 'hooks/useLocale';

import { QueryParameters } from 'containers/IdeasIndexPage';

import filterModalMessages from 'components/FiltersModal/messages';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';
import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';
import { isFieldEnabled } from 'utils/projectUtils';

import messages from '../messages';
import { Sort } from '../shared/Filters/SortFilterDropdown';
import IdeasView from '../shared/IdeasView';
import tracks from '../tracks';

import FiltersModal from './FiltersModal';
import InputFilters from './InputFilters';

const gapWidth = 35;

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

const MobileSearchInput = styled(SearchInput)`
  margin-bottom: 20px;
`;

const MobileFilterButton = styled(Button)``;

const AboveContent = styled.div<{
  filterColumnWidth: number;
  isMapView: boolean;
}>`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  margin-right: ${({ filterColumnWidth, isMapView }) =>
    isMapView ? 0 : filterColumnWidth + gapWidth}px;
  margin-bottom: 8px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-right: 0;
    margin-top: 20px;
  `}
`;

const AboveContentLeft = styled.div`
  display: flex;
  align-items: center;
`;

const IdeasCount = styled.div`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  white-space: nowrap;
  display: flex;
  align-items: center;

  span > span {
    font-weight: 600;
  }
`;

const ContentLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
`;

const ContentRight = styled.div<{
  filterColumnWidth: number;
  top: number;
  maxHeightOffset: number;
}>`
  flex: 0 0 ${({ filterColumnWidth }) => filterColumnWidth}px;
  width: ${({ filterColumnWidth }) => filterColumnWidth}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: flex-start;
  margin-left: ${gapWidth}px;
  max-height: calc(100vh - ${({ maxHeightOffset }) => maxHeightOffset}px);
  position: sticky;
  top: ${({ top }) => top}px;
  overflow-y: scroll;
  padding-left: 8px;
  padding-right: 8px;
`;

export interface QueryParametersUpdate {
  sort?: Sort;
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
  title?: JSX.Element;
}

const IdeasWithFiltersSidebar = ({
  ideaQueryParameters,
  projectId,
  phaseId,
  defaultView,
  onUpdateQuery,
  showViewToggle,
  title,
}: Props) => {
  const locale = useLocale();
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

  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const loadIdeaMarkers = locationEnabled && selectedView === 'map';
  const { data: ideaMarkers } = useIdeaMarkers(
    {
      projectIds: projectId ? [projectId] : null,
      phaseId,
      ...ideaQueryParameters,
    },
    loadIdeaMarkers
  );

  const openFiltersModal = useCallback(() => {
    setFiltersModalOpened(true);
  }, []);

  const handleSearchOnChange = useCallback(
    (search: string) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      onUpdateQuery({ search: search ?? undefined });
    },
    [onUpdateQuery]
  );

  const handleSortOnChange = useCallback(
    (sort: Sort) => {
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

  const closeModal = useCallback(() => {
    setFiltersModalOpened(false);
  }, []);

  const [isCTABarVisible, setIsCTABarVisible] = useState(false);

  useEffect(() => {
    function checkCTABarVisibility() {
      if (document.getElementById('project-cta-bar')) {
        setIsCTABarVisible(true);
      }
    }

    window.addEventListener('scrollend', checkCTABarVisibility);
    return () => window.removeEventListener('scroll', checkCTABarVisibility);
  }, []);

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

  return (
    <Container id="e2e-ideas-container">
      <Box display="flex" justifyContent="space-between">
        {title}
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
          {!biggerThanLargeTablet && (
            <>
              <FiltersModal
                opened={filtersModalOpened}
                selectedIdeaFilters={ideaQueryParameters}
                filtersActive={filtersActive}
                ideasFilterCounts={ideasFilterCounts}
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                numberOfSearchResults={list ? list.length : 0}
                onClearFilters={clearFilters}
                onSearch={handleSearchOnChange}
                onChangeStatus={handleStatusOnChange}
                onChangeTopics={handleTopicsOnChange}
                onClose={closeModal}
                handleSortOnChange={handleSortOnChange}
              />

              <MobileSearchInput
                defaultValue={ideaQueryParameters.search}
                onChange={handleSearchOnChange}
                a11y_numberOfSearchResults={list.length}
              />

              <MobileFilterButton
                buttonStyle="secondary-outlined"
                onClick={openFiltersModal}
                icon="filter"
                text={<FormattedMessage {...messages.filter} />}
              />
            </>
          )}

          <AboveContent
            filterColumnWidth={filterColumnWidth}
            isMapView={selectedView === 'map'}
          >
            {/* This is effectively on the right,
              with the help of flexbox. The HTML order, however,
              needed to be like this for a11y (tab order).
             */}
            <AboveContentLeft>
              {!isNilOrError(ideasFilterCounts) && (
                <IdeasCount>
                  <FormattedMessage
                    {...messages.xResults}
                    values={{
                      ideasCount: ideasFilterCounts.data.attributes.total,
                    }}
                  />
                </IdeasCount>
              )}
            </AboveContentLeft>
          </AboveContent>

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
                hasFilterSidebar={true}
                projectId={projectId}
                phaseId={phaseId}
                ideaMarkers={ideaMarkers}
              />
            </ContentLeft>

            {biggerThanLargeTablet && selectedView === 'card' && (
              <ContentRight
                id="e2e-ideas-filters"
                filterColumnWidth={filterColumnWidth}
                top={isCTABarVisible ? 160 : 100}
                maxHeightOffset={isCTABarVisible ? 180 : 120}
              >
                {/*
                  We have this Filters heading in the filters modal on mobile. 
                  This title streamlines the experience on desktop (for screen reader users).
                */}
                <ScreenReaderOnly>
                  <Title as="h2">
                    <FormattedMessage {...filterModalMessages.filters} />
                  </Title>
                </ScreenReaderOnly>
                <InputFilters
                  defaultValue={ideaQueryParameters.search}
                  selectedIdeaFilters={ideaQueryParameters}
                  filtersActive={filtersActive}
                  ideasFilterCounts={ideasFilterCounts}
                  numberOfSearchResults={list.length}
                  onClearFilters={clearFilters}
                  onSearch={handleSearchOnChange}
                  onChangeStatus={handleStatusOnChange}
                  onChangeTopics={handleTopicsOnChange}
                  handleSortOnChange={handleSortOnChange}
                  phaseId={ideaQueryParameters.phase}
                />
              </ContentRight>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default IdeasWithFiltersSidebar;
