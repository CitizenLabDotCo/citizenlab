import React, { useState, useCallback, useMemo, lazy } from 'react';

import {
  Spinner,
  useWindowSize,
  media,
  colors,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
  Box,
} from '@citizenlab/cl2-component-library';
import { isNumber } from 'lodash-es';
import { MessageDescriptor } from 'react-intl';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useInfitineInitiatives from 'api/initiatives/useInfiniteInitiatives';
import useInitiativesFilterCounts from 'api/initiatives_filter_counts/useInitiativesFilterCounts';

import BottomBar from 'components/FiltersModal/BottomBar';
import TopBar from 'components/FiltersModal/TopBar';
import { Sort } from 'components/InitiativeCards/SortFilterDropdown';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';
import Button from 'components/UI/Button';
import FullscreenModal from 'components/UI/FullscreenModal';
import SearchInput from 'components/UI/SearchInput';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { isNilOrError } from 'utils/helperUtils';

import EmptyProposals from './EmptyProposals';
import messages from './messages';
import ProposalsList from './ProposalsList';
import SortFilterDropdown from './SortFilterDropdown';
import StatusFilterBox from './StatusFilterBox';
import TopicFilterBox from './TopicFilterBox';
import tracks from './tracks';

const InitiativeMap = lazy(() => import('components/InitiativeMap'));

const gapWidth = 35;

const Container = styled.div`
  width: 100%;
  max-width: 1345px;
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

const AboveContent = styled.div<{ filterColumnWidth: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: ${({ filterColumnWidth }) => filterColumnWidth + gapWidth}px;
  margin-bottom: 22px;

  ${media.tablet`
    margin-right: 0;
    margin-top: 20px;
  `}
`;

const InitiativesCount = styled.div`
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

const ContentRight = styled.div<{ filterColumnWidth: number }>`
  flex: 0 0 ${({ filterColumnWidth }) => filterColumnWidth}px;
  width: ${({ filterColumnWidth }) => filterColumnWidth}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
  margin-left: ${gapWidth}px;
  position: relative;
`;

const ClearFiltersText = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: auto;
`;

const ClearFiltersButton = styled.button`
  height: 32px;
  position: absolute;
  top: -48px;
  right: 0px;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;

  &:hover {
    ${ClearFiltersText} {
      color: #000;
    }
  }
`;

const DesktopSearchInput = styled(SearchInput)`
  margin-bottom: 20px;

  ${media.tablet`
    display: none;
  `}
`;

interface Props {
  className?: string;
  invisibleTitleMessage: MessageDescriptor;
}

interface QueryParameters {
  publication_status: 'published';
  sort: Sort;
  search?: string;
  initiative_status?: string;
  topics?: string[];
}

const InitiativeCards = ({ className, invisibleTitleMessage }: Props) => {
  const { formatMessage } = useIntl();
  const { windowWidth } = useWindowSize();

  const [searchParams] = useSearchParams();

  const sortParam = searchParams.get('sort') as Sort | null;
  const searchParam = searchParams.get('search');
  const initiativeStatusParam = searchParams.get('initiative_status');
  const topicsParam = searchParams.get('topics');
  const selectedInitiativeMarkerId = searchParams.get('initiative_map_id');

  const selectedView =
    (searchParams.get('view') as 'card' | 'map' | null) ??
    (selectedInitiativeMarkerId ? 'map' : 'card');

  const setSelectedView = useCallback((view: 'card' | 'map') => {
    updateSearchParams({ view });
  }, []);

  const [filtersModalOpened, setFiltersModalOpened] = useState(false);

  const selectedInitiativeFilters = useMemo<QueryParameters>(
    () => ({
      publication_status: 'published',
      sort: sortParam ?? 'new',
      search: searchParam ?? undefined,
      initiative_status: initiativeStatusParam ?? undefined,
      topics: topicsParam ? JSON.parse(topicsParam) : undefined,
    }),
    [sortParam, searchParam, initiativeStatusParam, topicsParam]
  );

  const {
    data: initiatives,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
  } = useInfitineInitiatives(selectedInitiativeFilters);

  const { data: initiativesFilterCounts } = useInitiativesFilterCounts(
    selectedInitiativeFilters
  );

  const flatInitiatives = initiatives?.pages.flatMap((page) => page.data) || [];

  const openFiltersModal = () => {
    setFiltersModalOpened(true);
  };

  const loadMore = () => {
    trackEventByName(tracks.loadMoreProposals);
    fetchNextPage();
  };

  const handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });

    updateSearchParams({ sort });
  };

  const handleSearchOnChange = useCallback((search: string | null) => {
    updateSearchParams({ search });
  }, []);

  const handleStatusOnChange = (initiative_status: string | null) => {
    updateSearchParams({ initiative_status });
  };

  const handleTopicsOnChange = (topics: string[] | null) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });

    updateSearchParams({ topics });
  };

  const closeModal = () => {
    setFiltersModalOpened(false);
  };

  const resetFilters = () => {
    updateSearchParams({
      sort: undefined,
      search: undefined,
      initiative_status: undefined,
      topics: undefined,
    });
  };

  const closeModalAndRevertFilters = () => {
    closeModal();
    resetFilters();
  };

  const selectView = (selectedView: 'card' | 'map') => {
    setSelectedView(selectedView);
  };

  const filterMessage = <FormattedMessage {...messages.filter} />;
  const searchPlaceholder = formatMessage(messages.searchPlaceholder);
  const searchAriaLabel = formatMessage(messages.searchPlaceholder);
  const biggerThanLargeTablet =
    windowWidth && windowWidth >= viewportWidths.tablet;
  const biggerThanSmallTablet =
    windowWidth && windowWidth >= viewportWidths.tablet;
  const filterColumnWidth = windowWidth && windowWidth < 1400 ? 340 : 352;
  const filtersActive =
    selectedInitiativeFilters?.search ||
    selectedInitiativeFilters?.initiative_status ||
    selectedInitiativeFilters?.topics;

  const filtersSidebar = (
    <Box className={className} position="relative">
      {filtersActive && (
        <ClearFiltersButton onClick={resetFilters}>
          <ClearFiltersText>
            <FormattedMessage {...messages.resetFilters} />
          </ClearFiltersText>
        </ClearFiltersButton>
      )}

      <ScreenReaderOnly aria-live="polite">
        {initiativesFilterCounts && (
          <FormattedMessage
            {...messages.a11y_totalInitiatives}
            values={{
              initiativeCount: initiativesFilterCounts.data.attributes.total,
            }}
          />
        )}
      </ScreenReaderOnly>

      <DesktopSearchInput
        defaultValue={selectedInitiativeFilters.search ?? undefined}
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
        onChange={handleSearchOnChange}
        a11y_numberOfSearchResults={flatInitiatives?.length || 0}
      />
      <Box mb="20px">
        <StatusFilterBox
          selectedStatusId={selectedInitiativeFilters.initiative_status}
          selectedInitiativeFilters={selectedInitiativeFilters}
          onChange={handleStatusOnChange}
        />
      </Box>
      <TopicFilterBox
        selectedTopicIds={selectedInitiativeFilters.topics}
        onChange={handleTopicsOnChange}
      />
    </Box>
  );

  if (isLoading) {
    return (
      <InitialLoading id="initiatives-loading">
        <Spinner />
      </InitialLoading>
    );
  }

  return (
    <Container id="e2e-initiatives-container" className={className}>
      <ScreenReaderOnly>
        <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
      </ScreenReaderOnly>

      {flatInitiatives !== undefined && (
        <>
          {!biggerThanLargeTablet && (
            <>
              <FullscreenModal
                opened={filtersModalOpened}
                close={closeModal}
                animateInOut={true}
                topBar={
                  <TopBar
                    onReset={closeModalAndRevertFilters}
                    onClose={closeModal}
                  />
                }
                bottomBar={
                  <BottomBar
                    buttonText={
                      initiativesFilterCounts?.data.attributes.total &&
                      isNumber(
                        initiativesFilterCounts?.data.attributes.total
                      ) ? (
                        <FormattedMessage
                          {...messages.showXInitiatives}
                          values={{
                            initiativesCount:
                              initiativesFilterCounts?.data.attributes.total,
                          }}
                        />
                      ) : (
                        <FormattedMessage {...messages.showInitiatives} />
                      )
                    }
                    onClick={closeModal}
                  />
                }
              >
                <Box background={colors.background} p="15px">
                  {filtersSidebar}
                </Box>
              </FullscreenModal>

              <Box mb="20px">
                <SearchInput
                  defaultValue={selectedInitiativeFilters.search ?? undefined}
                  placeholder={searchPlaceholder}
                  ariaLabel={searchAriaLabel}
                  onChange={handleSearchOnChange}
                  a11y_numberOfSearchResults={flatInitiatives?.length || 0}
                />
              </Box>

              <Button
                buttonStyle="secondary-outlined"
                onClick={openFiltersModal}
                icon="filter"
                text={filterMessage}
              />
            </>
          )}

          <AboveContent filterColumnWidth={filterColumnWidth}>
            <Box display="flex" alignItems="center" mr="auto">
              <Box mr="20px">
                <ViewButtons onClick={selectView} selectedView={selectedView} />
              </Box>

              {!isNilOrError(initiativesFilterCounts) &&
                biggerThanSmallTablet && (
                  <InitiativesCount>
                    <FormattedMessage
                      {...messages.xInitiatives}
                      values={{
                        initiativesCount:
                          initiativesFilterCounts.data.attributes.total,
                      }}
                    />
                  </InitiativesCount>
                )}
            </Box>

            {selectedView === 'card' && (
              <SortFilterDropdown
                defaultSortingMethod={selectedInitiativeFilters.sort}
                onChange={handleSortOnChange}
                alignment="right"
              />
            )}
          </AboveContent>

          <Box display="flex">
            <Box
              display="flex"
              flex="1"
              flexDirection="column"
              alignItems="stretch"
              position="relative"
            >
              {flatInitiatives?.length > 0 ? (
                <>
                  {selectedView === 'card' && (
                    <ProposalsList
                      ariaLabelledBy={'view-tab-1'}
                      id={'view-panel-1'}
                      hasMore={!!hasNextPage}
                      loadingMore={isFetchingNextPage}
                      querying={isLoading}
                      onLoadMore={loadMore}
                      list={flatInitiatives}
                    />
                  )}

                  {selectedView === 'map' && (
                    <Box aria-labelledby={'view-tab-2'} id={'view-panel-2'}>
                      <InitiativeMap list={flatInitiatives} />
                    </Box>
                  )}
                </>
              ) : (
                <EmptyProposals />
              )}
            </Box>

            {biggerThanLargeTablet && (
              <ContentRight
                id="e2e-initiatives-filters"
                filterColumnWidth={filterColumnWidth}
              >
                {filtersSidebar}
              </ContentRight>
            )}
          </Box>
        </>
      )}
    </Container>
  );
};

export default InitiativeCards;
