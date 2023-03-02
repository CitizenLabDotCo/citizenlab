import React, { useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import useIdeasFilterCounts from 'hooks/useIdeasFilterCounts';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// components
import { Spinner, useWindowSize } from '@citizenlab/cl2-component-library';
import FiltersModal from './FiltersModal';
import FiltersSideBar from './FiltersSideBar';
import SortFilterDropdown from '../shared/Filters/SortFilterDropdown';
import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';
import IdeasView from '../shared/IdeasView';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import {
  media,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';

// typings
import { Sort, IIdeasQueryParameters } from 'services/ideas';

const gapWidth = 35;

const Container = styled.div`
  width: 100%;
  max-width: 1445px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  @media (max-width: 1279px) {
    max-width: 1000px;
  }
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

const AboveContentRight = styled.div`
  margin-left: auto;
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
  position: relative;
  position: sticky;
  top: 100px;
`;

export interface Props {
  ideaQueryParameters: IIdeasQueryParameters;
  onUpdateQuery: (newParams: Partial<IIdeasQueryParameters>) => void;
}

const IdeaCards = ({ ideaQueryParameters, onUpdateQuery }: Props) => {
  const { windowWidth } = useWindowSize();

  const { data, isFetching, fetchNextPage, hasNextPage } =
    useInfiniteIdeas(ideaQueryParameters);

  const list = data?.pages.map((page) => page.data).flat();
  const ideasFilterCounts = useIdeasFilterCounts(ideaQueryParameters);

  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const openFiltersModal = useCallback(() => {
    setFiltersModalOpened(true);
  }, []);

  const handleSearchOnChange = useCallback(
    (search: string) => {
      onUpdateQuery({ search });
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
      onUpdateQuery({ idea_status });
    },
    [onUpdateQuery]
  );

  const handleTopicsOnChange = useCallback(
    (topics: string[] | null) => {
      onUpdateQuery({ topics });
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
  const smallerThan1440px = !!(windowWidth && windowWidth <= 1440);
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
                numberOfSearchResults={list ? list.length : 0}
                onClearFilters={clearFilters}
                onSearch={handleSearchOnChange}
                onChangeStatus={handleStatusOnChange}
                onChangeTopics={handleTopicsOnChange}
                onClose={closeModal}
              />

              <MobileSearchInput
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
            <AboveContentRight>
              <SortFilterDropdown
                onChange={handleSortOnChange}
                alignment="right"
              />
            </AboveContentRight>
            <AboveContentLeft>
              {!isNilOrError(ideasFilterCounts) && (
                <IdeasCount>
                  <FormattedMessage
                    {...messages.xResults}
                    values={{ ideasCount: ideasFilterCounts.total }}
                  />
                </IdeasCount>
              )}
            </AboveContentLeft>
          </AboveContent>

          <Content>
            <ContentLeft>
              <IdeasView
                list={list}
                querying={isFetching}
                onLoadMore={fetchNextPage}
                hasMore={!!hasNextPage}
                loadingMore={isFetching}
                hideImage={biggerThanLargeTablet && smallerThan1440px}
                hideImagePlaceholder={smallerThan1440px}
                hideIdeaStatus={
                  (biggerThanLargeTablet && smallerThan1440px) ||
                  smallerThanPhone
                }
                showListView={true}
                showMapView={false}
              />
            </ContentLeft>

            {biggerThanLargeTablet && (
              <ContentRight
                id="e2e-ideas-filters"
                filterColumnWidth={filterColumnWidth}
              >
                <FiltersSideBar
                  selectedIdeaFilters={ideaQueryParameters}
                  filtersActive={filtersActive}
                  ideasFilterCounts={ideasFilterCounts}
                  numberOfSearchResults={list ? list.length : 0}
                  onClearFilters={clearFilters}
                  onSearch={handleSearchOnChange}
                  onChangeStatus={handleStatusOnChange}
                  onChangeTopics={handleTopicsOnChange}
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
