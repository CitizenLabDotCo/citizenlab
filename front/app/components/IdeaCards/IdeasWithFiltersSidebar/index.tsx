import React, { useCallback, useState } from 'react';

import {
  media,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
  isRtl,
  Spinner,
  useWindowSize,
  Title,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IdeaSortMethod } from 'api/phases/types';

import { QueryParameters } from 'containers/IdeasIndexPage';

import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';
import IdeasView from '../shared/IdeasView';
import tracks from '../tracks';

import FiltersModal from './FiltersModal';
import filterModalMessages from './FiltersModal/messages';
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

const AboveContent = styled.div<{ filterColumnWidth: number }>`
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  justify-content: space-between;
  margin-right: ${({ filterColumnWidth }) => filterColumnWidth + gapWidth}px;
  margin-bottom: 22px;

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

const Content = styled.div`
  display: flex;
`;

const ContentLeft = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
`;

const ContentRight = styled.div<{ filterColumnWidth: number }>`
  flex: 0 0 ${({ filterColumnWidth }) => filterColumnWidth}px;
  width: ${({ filterColumnWidth }) => filterColumnWidth}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-self: flex-start;
  margin-left: ${gapWidth}px;
  max-height: calc(100vh - 120px);
  position: sticky;
  top: 100px;
  overflow-y: scroll;
  padding-left: 8px;
  padding-right: 8px;
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
}

const IdeaCards = ({ ideaQueryParameters, onUpdateQuery }: Props) => {
  const { windowWidth } = useWindowSize();

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteIdeas(ideaQueryParameters);

  const list = data?.pages.map((page) => page.data).flat();
  const { data: ideasFilterCounts } = useIdeasFilterCounts(ideaQueryParameters);

  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

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

  const closeModal = useCallback(() => {
    setFiltersModalOpened(false);
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

          <AboveContent filterColumnWidth={filterColumnWidth}>
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

          <Content>
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
                view="card"
                hasMoreThanOneView={false}
                hasFilterSidebar={true}
              />
            </ContentLeft>

            {biggerThanLargeTablet && (
              <ContentRight
                id="e2e-ideas-filters"
                filterColumnWidth={filterColumnWidth}
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
          </Content>
        </>
      )}
    </Container>
  );
};

export default IdeaCards;
