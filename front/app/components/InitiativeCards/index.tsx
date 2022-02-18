import React, { PureComponent } from 'react';
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

//  Typings
import { MessageDescriptor } from 'typings';

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
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// style
import styled, { withTheme } from 'styled-components';
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

  ${media.smallerThanMinTablet`
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

  ${media.smallerThanMaxTablet`
    margin-right: 0;
    margin-top: 20px;
  `}
`;

const AboveContentLeft = styled.div`
  display: flex;
  align-items: center;
`;

const AboveContentRight = styled.div`
  display: flex;
  align-items: center;
`;

const InitiativesCount = styled.div`
  color: ${({ theme }) => theme.colorText};
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
  color: ${colors.label};
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

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledInitiativesStatusFilter = styled(StatusFilterBox)`
  margin-bottom: 20px;
`;

const StyledInitiativesTopicsFilter = styled(TopicFilterBox)`
  margin-bottom: 0px;
`;

const Spacer = styled.div`
  flex: 1;
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

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  selectedView: 'card' | 'map';
  filtersModalOpened: boolean;
  selectedInitiativeFilters: Partial<IQueryParameters>;
  previouslySelectedInitiativeFilters: Partial<IQueryParameters> | null;
}

class InitiativeCards extends PureComponent<Props & InjectedIntlProps, State> {
  desktopSearchInputClearButton: HTMLButtonElement | null = null;
  mobileSearchInputClearButton: HTMLButtonElement | null = null;

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      selectedView: 'card',
      filtersModalOpened: false,
      selectedInitiativeFilters: get(props.initiatives, 'queryParameters', {}),
      previouslySelectedInitiativeFilters: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const oldQueryParameters = get(
      prevProps.initiatives,
      'queryParameters',
      null
    );
    const newQueryParameters = get(
      this.props.initiatives,
      'queryParameters',
      null
    );

    if (newQueryParameters !== oldQueryParameters) {
      this.setState({
        selectedInitiativeFilters: get(
          this.props.initiatives,
          'queryParameters',
          {}
        ),
      });
    }
  }

  openFiltersModal = () => {
    this.setState((state) => ({
      filtersModalOpened: true,
      previouslySelectedInitiativeFilters: state.selectedInitiativeFilters,
    }));
  };

  loadMore = () => {
    trackEventByName(tracks.loadMoreProposals);
    this.props.initiatives.onLoadMore();
  };

  handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });
    this.props.initiatives.onChangeSorting(sort);
  };

  handleSearchOnChange = (searchTerm: string) => {
    this.props.initiatives.onChangeSearchTerm(searchTerm);
  };

  handleStatusOnChange = (initiative_status: string | null) => {
    this.handleInitiativeFiltersOnChange({ initiative_status });
  };

  handleTopicsOnChange = (topics: string[] | null) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });
    this.handleInitiativeFiltersOnChange({ topics });
  };

  handleStatusOnChangeAndApplyFilter = (initiative_status: string | null) => {
    this.handleInitiativeFiltersOnChange({ initiative_status }, true);
  };

  handleTopicsOnChangeAndApplyFilter = (topics: string[] | null) => {
    this.handleInitiativeFiltersOnChange({ topics }, true);
  };

  handleInitiativeFiltersOnChange = (
    newSelectedInitiativeFilters: Partial<IQueryParameters>,
    applyFilter = false
  ) => {
    this.setState((state) => {
      const selectedInitiativeFilters = {
        ...state.selectedInitiativeFilters,
        ...newSelectedInitiativeFilters,
      };

      if (applyFilter) {
        this.props.initiatives.onInitiativeFiltering(selectedInitiativeFilters);
      }

      return { selectedInitiativeFilters };
    });
  };

  handleInitiativeFiltersOnReset = () => {
    this.setState((state) => {
      const selectedInitiativeFilters = {
        ...state.selectedInitiativeFilters,
        initiative_status: null,
        areas: null,
        topics: null,
      };

      return { selectedInitiativeFilters };
    });
  };

  handleInitiativeFiltersOnResetAndApply = () => {
    this.setState((state) => {
      const selectedInitiativeFilters = {
        ...state.selectedInitiativeFilters,
        search: null,
        initiative_status: null,
        areas: null,
        topics: null,
      };

      this.desktopSearchInputClearButton?.click();
      this.mobileSearchInputClearButton?.click();

      this.props.initiatives.onInitiativeFiltering(selectedInitiativeFilters);

      return { selectedInitiativeFilters };
    });
  };

  closeModalAndApplyFilters = () => {
    this.setState((state) => {
      this.props.initiatives.onInitiativeFiltering(
        state.selectedInitiativeFilters
      );

      return {
        filtersModalOpened: false,
        previouslySelectedInitiativeFilters: null,
      };
    });
  };

  closeModalAndRevertFilters = () => {
    this.setState((state) => {
      this.props.initiatives.onInitiativeFiltering(
        state.previouslySelectedInitiativeFilters || {}
      );

      return {
        filtersModalOpened: false,
        selectedInitiativeFilters:
          state.previouslySelectedInitiativeFilters || {},
        previouslySelectedInitiativeFilters: null,
      };
    });
  };

  selectView = (selectedView: 'card' | 'map') => {
    this.setState({ selectedView });
  };

  handleDesktopSearchInputClearButtonRef = (element: HTMLButtonElement) => {
    this.desktopSearchInputClearButton = element;
  };

  handleMobileSearchInputClearButtonRef = (element: HTMLButtonElement) => {
    this.mobileSearchInputClearButton = element;
  };

  filterMessage = (<FormattedMessage {...messages.filter} />);
  searchPlaceholder = this.props.intl.formatMessage(messages.searchPlaceholder);
  searchAriaLabel = this.props.intl.formatMessage(messages.searchPlaceholder);

  render() {
    const { selectedView, selectedInitiativeFilters, filtersModalOpened } =
      this.state;
    const {
      initiatives,
      initiativesFilterCounts,
      windowSize,
      className,
      invisibleTitleMessage,
    } = this.props;
    const { list, querying } = initiatives;
    const hasInitiatives = !isNilOrError(list) && list.length > 0;
    const biggerThanLargeTablet =
      windowSize && windowSize >= viewportWidths.largeTablet;
    const biggerThanSmallTablet =
      windowSize && windowSize >= viewportWidths.smallTablet;
    const filterColumnWidth = windowSize && windowSize < 1400 ? 340 : 352;
    const filtersActive =
      selectedInitiativeFilters.search ||
      selectedInitiativeFilters.initiative_status ||
      selectedInitiativeFilters.areas ||
      selectedInitiativeFilters.topics;

    const filtersSidebar = (
      <FiltersSidebarContainer className={className}>
        {filtersActive && (
          <ClearFiltersButton
            onClick={this.handleInitiativeFiltersOnResetAndApply}
          >
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
          placeholder={this.searchPlaceholder}
          ariaLabel={this.searchAriaLabel}
          setClearButtonRef={this.handleDesktopSearchInputClearButtonRef}
          onChange={this.handleSearchOnChange}
        />
        <StyledInitiativesStatusFilter
          selectedStatusId={selectedInitiativeFilters.initiative_status}
          selectedInitiativeFilters={selectedInitiativeFilters}
          onChange={
            !biggerThanLargeTablet
              ? this.handleStatusOnChange
              : this.handleStatusOnChangeAndApplyFilter
          }
        />
        <StyledInitiativesTopicsFilter
          selectedTopicIds={selectedInitiativeFilters.topics}
          onChange={
            !biggerThanLargeTablet
              ? this.handleTopicsOnChange
              : this.handleTopicsOnChangeAndApplyFilter
          }
        />
      </FiltersSidebarContainer>
    );

    return (
      <Container id="e2e-initiatives-container" className={className}>
        <ScreenReaderOnly>
          <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
        </ScreenReaderOnly>

        {list === undefined && (
          <InitialLoading id="initiatives-loading">
            <Spinner />
          </InitialLoading>
        )}

        {list !== undefined && (
          <>
            {!biggerThanLargeTablet && (
              <>
                <FullscreenModal
                  opened={filtersModalOpened}
                  close={this.closeModalAndRevertFilters}
                  animateInOut={true}
                  topBar={
                    <TopBar
                      onReset={
                        !biggerThanLargeTablet
                          ? this.handleInitiativeFiltersOnReset
                          : this.handleInitiativeFiltersOnResetAndApply
                      }
                      onClose={this.closeModalAndRevertFilters}
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
                            onClick={this.closeModalAndApplyFilters}
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
                  placeholder={this.searchPlaceholder}
                  ariaLabel={this.searchAriaLabel}
                  setClearButtonRef={this.handleMobileSearchInputClearButtonRef}
                  onChange={this.handleSearchOnChange}
                />

                <MobileFilterButton
                  buttonStyle="secondary-outlined"
                  onClick={this.openFiltersModal}
                  icon="filter"
                  text={this.filterMessage}
                />
              </>
            )}

            <AboveContent filterColumnWidth={filterColumnWidth}>
              <AboveContentLeft>
                <StyledViewButtons
                  onClick={this.selectView}
                  selectedView={selectedView}
                />

                {!isNilOrError(initiativesFilterCounts) &&
                  biggerThanSmallTablet && (
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

              <Spacer />

              {selectedView === 'card' && (
                <AboveContentRight>
                  <SortFilterDropdown
                    onChange={this.handleSortOnChange}
                    alignment="right"
                  />
                </AboveContentRight>
              )}
            </AboveContent>

            <Content>
              <ContentLeft>
                {selectedView === 'card' && <ProposalsList />}

                {selectedView === 'map' && <InitiativesMap />}

                {!querying && !hasInitiatives && <EmptyProposals />}
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
  }
}

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

const WithFiltersSidebarWithHoCs = withTheme(injectIntl(InitiativeCards));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <WithFiltersSidebarWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
