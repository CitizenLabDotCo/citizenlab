import React, { useState, useCallback } from 'react';
import { adopt } from 'react-adopt';
import { get, isNumber } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// tracks
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import InitiativesMap from 'components/InitiativesMap';
import { Spinner } from '@citizenlab/cl2-component-library';
import SortFilterDropdown from './SortFilterDropdown';
import StatusFilterBox from './StatusFilterBox';
import TopicFilterBox from './TopicFilterBox';
import SearchInput from 'components/UI/SearchInput';
import TopBar from 'components/FiltersModal/TopBar';
import BottomBar from 'components/FiltersModal/BottomBar';
import FullscreenModal from 'components/UI/FullscreenModal';
import Button from 'components/UI/Button';
import ViewButtons from 'components/PostCardsComponents/ViewButtons';

// resources
import GetInitiatives, {
  Sort,
  GetInitiativesChildProps,
  IQueryParameters,
} from 'resources/GetInitiatives';
import GetInitiativesFilterCounts, {
  GetInitiativesFilterCountsChildProps,
} from 'resources/GetInitiativesFilterCounts';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// i18n
import messages from './messages';
import { MessageDescriptor } from 'react-intl';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import EmptyProposals from './EmptyProposals';
import ProposalsList from './ProposalsList';
import useInfitineInitiatives from 'api/initiatives/useInfiniteInitiatives';

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

const MobileSearchInput = styled(SearchInput)`
  margin-bottom: 20px;
`;

const MobileFilterButton = styled(Button)``;

const MobileFiltersSidebarWrapper = styled.div`
  background: ${colors.background};
  padding: 15px;
`;

const AboveContent = styled.div<{ filterColumnWidth: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: ${({ filterColumnWidth }) => filterColumnWidth + gapWidth}px;
  margin-bottom: 22px;
  flex-direction: row-reverse;

  ${media.tablet`
    margin-right: 0;
    margin-top: 20px;
  `}
`;

const AboveContentLeft = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
`;

const AboveContentRight = styled.div``;

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
  align-items: stretch;
  margin-left: ${gapWidth}px;
  position: relative;
`;

const FiltersSidebarContainer = styled.div`
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

const StyledInitiativesStatusFilter = styled(StatusFilterBox)`
  margin-bottom: 20px;
`;

const StyledInitiativesTopicsFilter = styled(TopicFilterBox)`
  margin-bottom: 0px;
`;

const StyledViewButtons = styled(ViewButtons)`
  margin-right: 20px;
`;

interface InputProps {
  className?: string;
  invisibleTitleMessage: MessageDescriptor;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
  initiatives: GetInitiativesChildProps;
  initiativesFilterCounts: GetInitiativesFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativeCards = ({
  className,
  invisibleTitleMessage,
  windowSize,
  initiativesFilterCounts,
}: Props) => {
  const { formatMessage } = useIntl();

  const [selectedView, setSelectedView] = useState<'map' | 'card'>('card');
  const [filtersModalOpened, setFiltersModalOpened] = useState(false);
  const [selectedInitiativeFilters, setSelectedInitiativeFilters] = useState<
    Partial<IQueryParameters>
  >({});
  const {
    data: initiatives,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
  } = useInfitineInitiatives(selectedInitiativeFilters);

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
    setSelectedInitiativeFilters({ ...selectedInitiativeFilters, sort });
  };

  const handleSearchOnChange = useCallback((search: string) => {
    setSelectedInitiativeFilters((selectedInitiativeFilters) => ({
      ...selectedInitiativeFilters,
      search,
    }));
  }, []);

  const handleStatusOnChange = (initiative_status: string | null) => {
    setSelectedInitiativeFilters({
      ...selectedInitiativeFilters,
      initiative_status,
    });
  };

  const handleTopicsOnChange = (topics: string[] | null) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });
    setSelectedInitiativeFilters({ ...selectedInitiativeFilters, topics });
  };

  const handleStatusOnChangeAndApplyFilter = (
    initiative_status: string | null
  ) => {
    setSelectedInitiativeFilters({ initiative_status });
  };

  const handleTopicsOnChangeAndApplyFilter = (topics: string[] | null) => {
    setSelectedInitiativeFilters({ topics });
  };

  const handleInitiativeFiltersOnReset = () => {
    setSelectedInitiativeFilters({});
  };

  const closeModalAndApplyFilters = () => {
    setFiltersModalOpened(false);
  };

  const closeModalAndRevertFilters = () => {
    setFiltersModalOpened(false);
    setSelectedInitiativeFilters({});
  };

  const selectView = (selectedView: 'card' | 'map') => {
    setSelectedView(selectedView);
  };

  const filterMessage = <FormattedMessage {...messages.filter} />;
  const searchPlaceholder = formatMessage(messages.searchPlaceholder);
  const searchAriaLabel = formatMessage(messages.searchPlaceholder);

  const hasInitiatives = initiatives && initiatives.pages.length > 0;
  const biggerThanLargeTablet =
    windowSize && windowSize >= viewportWidths.tablet;
  const biggerThanSmallTablet =
    windowSize && windowSize >= viewportWidths.tablet;
  const filterColumnWidth = windowSize && windowSize < 1400 ? 340 : 352;
  const filtersActive =
    selectedInitiativeFilters?.search ||
    selectedInitiativeFilters?.initiative_status ||
    selectedInitiativeFilters?.areas ||
    selectedInitiativeFilters?.topics;

  const filtersSidebar = (
    <FiltersSidebarContainer className={className}>
      {filtersActive && (
        <ClearFiltersButton onClick={handleInitiativeFiltersOnReset}>
          <ClearFiltersText>
            <FormattedMessage {...messages.resetFilters} />
          </ClearFiltersText>
        </ClearFiltersButton>
      )}

      <ScreenReaderOnly aria-live="polite">
        {initiativesFilterCounts && (
          <FormattedMessage
            {...messages.a11y_totalInitiatives}
            values={{ initiativeCount: initiativesFilterCounts.total }}
          />
        )}
      </ScreenReaderOnly>

      <DesktopSearchInput
        placeholder={searchPlaceholder}
        ariaLabel={searchAriaLabel}
        onChange={handleSearchOnChange}
        a11y_numberOfSearchResults={flatInitiatives?.length || 0}
      />
      <StyledInitiativesStatusFilter
        selectedStatusId={selectedInitiativeFilters?.initiative_status}
        selectedInitiativeFilters={selectedInitiativeFilters || {}}
        onChange={
          !biggerThanLargeTablet
            ? handleStatusOnChange
            : handleStatusOnChangeAndApplyFilter
        }
      />
      <StyledInitiativesTopicsFilter
        selectedTopicIds={selectedInitiativeFilters?.topics}
        onChange={
          !biggerThanLargeTablet
            ? handleTopicsOnChange
            : handleTopicsOnChangeAndApplyFilter
        }
      />
    </FiltersSidebarContainer>
  );

  return (
    <Container id="e2e-initiatives-container" className={className}>
      <ScreenReaderOnly>
        <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
      </ScreenReaderOnly>

      {flatInitiatives === undefined && (
        <InitialLoading id="initiatives-loading">
          <Spinner />
        </InitialLoading>
      )}

      {flatInitiatives !== undefined && (
        <>
          {!biggerThanLargeTablet && (
            <>
              <FullscreenModal
                opened={filtersModalOpened}
                close={closeModalAndApplyFilters}
                animateInOut={true}
                topBar={
                  <TopBar
                    onReset={closeModalAndRevertFilters}
                    onClose={closeModalAndApplyFilters}
                  />
                }
                bottomBar={
                  <GetInitiativesFilterCounts
                    queryParameters={selectedInitiativeFilters}
                  >
                    {(newInitiativesFilterCounts) => {
                      const bottomBarButtonText =
                        newInitiativesFilterCounts &&
                        isNumber(newInitiativesFilterCounts.total) ? (
                          <FormattedMessage
                            {...messages.showXInitiatives}
                            values={{
                              initiativesCount:
                                newInitiativesFilterCounts.total,
                            }}
                          />
                        ) : (
                          <FormattedMessage {...messages.showInitiatives} />
                        );

                      return (
                        <BottomBar
                          buttonText={bottomBarButtonText}
                          onClick={closeModalAndApplyFilters}
                        />
                      );
                    }}
                  </GetInitiativesFilterCounts>
                }
              >
                <MobileFiltersSidebarWrapper>
                  {filtersSidebar}
                </MobileFiltersSidebarWrapper>
              </FullscreenModal>

              <MobileSearchInput
                placeholder={searchPlaceholder}
                ariaLabel={searchAriaLabel}
                onChange={handleSearchOnChange}
                a11y_numberOfSearchResults={flatInitiatives?.length || 0}
              />

              <MobileFilterButton
                buttonStyle="secondary-outlined"
                onClick={openFiltersModal}
                icon="filter"
                text={filterMessage}
              />
            </>
          )}

          <AboveContent filterColumnWidth={filterColumnWidth}>
            {/* This is effectively on the right,
                with the help of flexbox. The HTML order, however,
                needed to be like this for a11y (tab order).
               */}

            {selectedView === 'card' && (
              <AboveContentRight>
                <SortFilterDropdown
                  onChange={handleSortOnChange}
                  alignment="right"
                />
              </AboveContentRight>
            )}

            <AboveContentLeft>
              <StyledViewButtons
                onClick={selectView}
                selectedView={selectedView}
              />

              {!isNilOrError(initiativesFilterCounts) && biggerThanSmallTablet && (
                <InitiativesCount>
                  <FormattedMessage
                    {...messages.xInitiatives}
                    values={{
                      initiativesCount: initiativesFilterCounts.total,
                    }}
                  />
                </InitiativesCount>
              )}
            </AboveContentLeft>
          </AboveContent>

          <Content>
            <ContentLeft>
              {!isFetchingNextPage && hasInitiatives ? (
                <>
                  {selectedView === 'card' && (
                    <ProposalsList
                      ariaLabelledBy={'view-tab-1'}
                      id={'view-panel-1'}
                      hasMore={!!hasNextPage}
                      loadingMore={isFetchingNextPage}
                      querying={isFetching}
                      onLoadMore={loadMore}
                      list={flatInitiatives}
                    />
                  )}

                  {selectedView === 'map' && (
                    <InitiativesMap
                      ariaLabelledBy={'view-tab-2'}
                      id={'view-panel-2'}
                    />
                  )}
                </>
              ) : (
                <EmptyProposals />
              )}
            </ContentLeft>

            {biggerThanLargeTablet && (
              <ContentRight
                id="e2e-initiatives-filters"
                filterColumnWidth={filterColumnWidth}
              >
                {filtersSidebar}
              </ContentRight>
            )}
          </Content>
        </>
      )}
    </Container>
  );
};

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
  initiatives: (
    <GetInitiatives type="load-more" publicationStatus="published" />
  ),
  initiativesFilterCounts: ({ initiatives, render }) => (
    <GetInitiativesFilterCounts
      queryParameters={get(initiatives, 'queryParameters', null)}
    >
      {render}
    </GetInitiativesFilterCounts>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativeCards {...inputProps} {...dataProps} />}
  </Data>
);
