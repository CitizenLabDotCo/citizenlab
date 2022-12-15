import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { get, isNumber } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import { Spinner } from '@citizenlab/cl2-component-library';
import SortFilterDropdown from './SortFilterDropdown';
import StatusFilterBox from './StatusFilterBox';
import TopicFilterBox from './TopicFilterBox';
import SearchInput from 'components/UI/SearchInput';
import TopBar from 'components/FiltersModal/TopBar';
import BottomBar from 'components/FiltersModal/BottomBar';
import FullscreenModal from 'components/UI/FullscreenModal';
import Button from 'components/UI/Button';
import IdeasView from './IdeasView';

// resources
import GetIdeas, {
  Sort,
  GetIdeasChildProps,
  InputProps as GetIdeasInputProps,
  IQueryParameters,
} from 'resources/GetIdeas';
import GetIdeasFilterCounts, {
  GetIdeasFilterCountsChildProps,
} from 'resources/GetIdeasFilterCounts';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// style
import styled, { withTheme } from 'styled-components';
import {
  media,
  colors,
  fontSizes,
  viewportWidths,
  defaultCardStyle,
  isRtl,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// typings
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

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

const MobileFiltersSidebarWrapper = styled.div`
  background: ${colors.background};
  padding: 15px;
`;

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

const StyledIdeasStatusFilter = styled(StatusFilterBox)`
  margin-bottom: 20px;
`;

const StyledIdeasTopicsFilter = styled(TopicFilterBox)`
  margin-bottom: 0px;
`;

interface InputProps extends GetIdeasInputProps {
  defaultSortingMethod?: IdeaDefaultSortMethod;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
}

interface DataProps {
  windowWidth: GetWindowSizeChildProps;
  ideas: GetIdeasChildProps;
  ideasFilterCounts: GetIdeasFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  filtersModalOpened: boolean;
  selectedIdeaFilters: Partial<IQueryParameters>;
  previouslySelectedIdeaFilters: Partial<IQueryParameters> | null;
}

class IdeaCards extends PureComponent<Props & WrappedComponentProps, State> {
  desktopSearchInputClearButton: HTMLButtonElement | null = null;
  mobileSearchInputClearButton: HTMLButtonElement | null = null;

  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      filtersModalOpened: false,
      selectedIdeaFilters: get(props.ideas, 'queryParameters', {}),
      previouslySelectedIdeaFilters: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const oldQueryParameters = get(prevProps.ideas, 'queryParameters', null);
    const newQueryParameters = get(this.props.ideas, 'queryParameters', null);

    if (newQueryParameters !== oldQueryParameters) {
      this.setState({
        selectedIdeaFilters: get(this.props.ideas, 'queryParameters', {}),
      });
    }
  }

  openFiltersModal = () => {
    this.setState((state) => ({
      filtersModalOpened: true,
      previouslySelectedIdeaFilters: state.selectedIdeaFilters,
    }));
  };

  handleSortOnChange = (sort: Sort) => {
    trackEventByName(tracks.sortingFilter, {
      sort,
    });

    this.props.ideas.onChangeSorting(sort);
  };

  handleSearchOnChange = (searchTerm: string) => {
    this.props.ideas.onChangeSearchTerm(searchTerm);
  };

  handleStatusOnChange = (idea_status: string | null) => {
    this.handleIdeaFiltersOnChange({ idea_status });
  };

  handleTopicsOnChange = (topics: string[] | null) => {
    trackEventByName(tracks.topicsFilter, {
      topics,
    });

    this.handleIdeaFiltersOnChange({ topics });
  };

  handleStatusOnChangeAndApplyFilter = (idea_status: string | null) => {
    this.handleIdeaFiltersOnChange({ idea_status }, true);
  };

  handleTopicsOnChangeAndApplyFilter = (topics: string[] | null) => {
    this.handleIdeaFiltersOnChange({ topics }, true);
  };

  handleIdeaFiltersOnChange = (
    newSelectedIdeaFilters: Partial<IQueryParameters>,
    applyFilter = false
  ) => {
    this.setState((state) => {
      const selectedIdeaFilters = {
        ...state.selectedIdeaFilters,
        ...newSelectedIdeaFilters,
      };

      if (applyFilter) {
        this.props.ideas.onIdeaFiltering(selectedIdeaFilters);
      }

      return { selectedIdeaFilters };
    });
  };

  handleIdeaFiltersOnReset = () => {
    this.setState((state) => {
      const selectedIdeaFilters = {
        ...state.selectedIdeaFilters,
        idea_status: null,
        topics: null,
      };

      return { selectedIdeaFilters };
    });
  };

  handleIdeaFiltersOnResetAndApply = () => {
    this.setState((state) => {
      const selectedIdeaFilters = {
        ...state.selectedIdeaFilters,
        search: null,
        idea_status: null,
        topics: null,
      };

      this.desktopSearchInputClearButton?.click();
      this.mobileSearchInputClearButton?.click();

      this.props.ideas.onIdeaFiltering(selectedIdeaFilters);

      return { selectedIdeaFilters };
    });
  };

  closeModalAndApplyFilters = () => {
    this.setState((state) => {
      this.props.ideas.onIdeaFiltering(state.selectedIdeaFilters);

      return {
        filtersModalOpened: false,
        previouslySelectedIdeaFilters: null,
      };
    });
  };

  closeModalAndRevertFilters = () => {
    this.setState((state) => {
      this.props.ideas.onIdeaFiltering(
        state.previouslySelectedIdeaFilters || {}
      );

      return {
        filtersModalOpened: false,
        selectedIdeaFilters: state.previouslySelectedIdeaFilters || {},
        previouslySelectedIdeaFilters: null,
      };
    });
  };

  filterMessage = (<FormattedMessage {...messages.filter} />);

  render() {
    const { selectedIdeaFilters, filtersModalOpened } = this.state;
    const {
      defaultSortingMethod,
      ideas,
      ideasFilterCounts,
      windowWidth,
      className,
    } = this.props;
    const { list, hasMore, querying, onLoadMore } = ideas;
    const filterColumnWidth = windowWidth && windowWidth < 1400 ? 340 : 352;
    const filtersActive =
      selectedIdeaFilters.search ||
      selectedIdeaFilters.idea_status ||
      selectedIdeaFilters.topics;
    const biggerThanLargeTablet = !!(
      windowWidth && windowWidth >= viewportWidths.tablet
    );
    const smallerThan1440px = !!(windowWidth && windowWidth <= 1440);
    const smallerThanPhone = !!(
      windowWidth && windowWidth <= viewportWidths.phone
    );

    const filtersSidebar = (
      <FiltersSidebarContainer className={className}>
        {filtersActive && (
          <ClearFiltersButton onClick={this.handleIdeaFiltersOnResetAndApply}>
            <ClearFiltersText>
              <FormattedMessage {...messages.resetFilters} />
            </ClearFiltersText>
          </ClearFiltersButton>
        )}

        <ScreenReaderOnly aria-live="polite">
          {ideasFilterCounts && (
            <FormattedMessage
              {...messages.a11y_totalItems}
              values={{ ideasCount: ideasFilterCounts.total }}
            />
          )}
        </ScreenReaderOnly>

        <DesktopSearchInput
          onChange={this.handleSearchOnChange}
          debounce={1500}
          a11y_numberOfSearchResults={list ? list.length : 0}
        />
        <StyledIdeasStatusFilter
          selectedStatusId={selectedIdeaFilters.idea_status}
          selectedIdeaFilters={selectedIdeaFilters}
          onChange={
            !biggerThanLargeTablet
              ? this.handleStatusOnChange
              : this.handleStatusOnChangeAndApplyFilter
          }
        />
        <StyledIdeasTopicsFilter
          selectedTopicIds={selectedIdeaFilters.topics}
          onChange={
            !biggerThanLargeTablet
              ? this.handleTopicsOnChange
              : this.handleTopicsOnChangeAndApplyFilter
          }
        />
      </FiltersSidebarContainer>
    );

    return (
      <Container id="e2e-ideas-container" className={className}>
        {list === undefined && (
          <InitialLoading id="ideas-loading">
            <Spinner />
          </InitialLoading>
        )}

        {list && (
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
                          ? this.handleIdeaFiltersOnReset
                          : this.handleIdeaFiltersOnResetAndApply
                      }
                      onClose={this.closeModalAndRevertFilters}
                    />
                  }
                  bottomBar={
                    <GetIdeasFilterCounts queryParameters={selectedIdeaFilters}>
                      {(newIdeasFilterCounts) => {
                        const bottomBarButtonText =
                          newIdeasFilterCounts &&
                          isNumber(newIdeasFilterCounts.total) ? (
                            <FormattedMessage
                              {...messages.showXResults}
                              values={{
                                ideasCount: newIdeasFilterCounts.total,
                              }}
                            />
                          ) : (
                            <FormattedMessage {...messages.showResults} />
                          );

                        return (
                          <BottomBar
                            buttonText={bottomBarButtonText}
                            onClick={this.closeModalAndApplyFilters}
                          />
                        );
                      }}
                    </GetIdeasFilterCounts>
                  }
                >
                  <MobileFiltersSidebarWrapper>
                    {filtersSidebar}
                  </MobileFiltersSidebarWrapper>
                </FullscreenModal>

                <MobileSearchInput
                  onChange={this.handleSearchOnChange}
                  a11y_numberOfSearchResults={list.length}
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
              {/* This is effectively on the right,
                with the help of flexbox. The HTML order, however,
                needed to be like this for a11y (tab order).
               */}
              <AboveContentRight>
                <SortFilterDropdown
                  defaultSortingMethod={defaultSortingMethod || null}
                  onChange={this.handleSortOnChange}
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
                  querying={querying}
                  onLoadMore={onLoadMore}
                  hasMore={hasMore}
                  loadingMore={querying}
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
  windowWidth: <GetWindowSize />,
  ideas: ({ render, children: _children, ...getIdeasInputProps }) => (
    <GetIdeas
      {...getIdeasInputProps}
      pageSize={12}
      sort={
        getIdeasInputProps.defaultSortingMethod || ideaDefaultSortMethodFallback
      }
    >
      {render}
    </GetIdeas>
  ),
  ideasFilterCounts: ({ ideas, render }) => (
    <GetIdeasFilterCounts queryParameters={get(ideas, 'queryParameters', null)}>
      {render}
    </GetIdeasFilterCounts>
  ),
});

const WithFiltersSidebarWithHoCs = withTheme(injectIntl(IdeaCards));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps: DataProps) => (
      <WithFiltersSidebarWithHoCs {...inputProps} {...dataProps} />
    )}
  </Data>
);
