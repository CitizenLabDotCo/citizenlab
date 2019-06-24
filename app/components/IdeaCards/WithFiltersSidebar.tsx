import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCard from 'components/IdeaCard';
import IdeasMap from 'components/IdeasMap';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import SelectSort from './SelectSort';
import SearchInput from 'components/UI/SearchInput';
import FiltersSidebar from './FiltersSidebar';
import FiltersSidebarTopBar from './FiltersSidebar/TopBar';
import FiltersSidebarBottomBar from './FiltersSidebar/BottomBar';
import FullscreenModal from 'components/UI/FullscreenModal';
import Button from 'components/UI/Button';
import FeatureFlag from 'components/FeatureFlag';

// resources
import GetIdeas, { Sort, GetIdeasChildProps, InputProps as GetIdeasInputProps, IQueryParameters } from 'resources/GetIdeas';
import GetIdeasFilterCounts, { GetIdeasFilterCountsChildProps } from 'resources/GetIdeasFilterCounts';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

// utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';
import { darken, rgba } from 'polished';

// typings
import { ParticipationMethod } from 'services/participationContexts';

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
  border-radius: ${(props: any) => props.theme.borderRadius};
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);

  ${media.smallerThanMinTablet`
    height: 150px;
  `}
`;

const MobileSearchFilter = styled(SearchInput)`
  margin-bottom: 20px;
`;

const MobileFilterButton = styled(Button)``;

const MobileFiltersSidebarWrapper = styled.div`
  background: ${colors.background};
  padding: 15px;
`;

const StyledFiltersSidebar = styled(FiltersSidebar)``;

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

const IdeasCount = styled.div`
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

const Loading = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.biggerThanMinTablet`
    height: calc(100vh - 280px);
    position: sticky;
    top: 200px;
  `}

  ${media.smallerThanMinTablet`
    height: 150px;
  `}
`;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.biggerThanMinTablet`
    height: calc(100vh - 280px);
    position: sticky;
    top: 200px;
  `}

  ${media.smallerThanMinTablet`
    height: 150px;
  `}
`;

const EmptyContainerInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-left: 30px;
  padding-right: 30px;
`;

const IdeaIcon = styled(Icon)`
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  fill: ${colors.label};
`;

const EmptyMessage = styled.div`
  max-width: 400px;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
  margin-top: 10px;
`;

const EmptyMessageMainLine = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
  margin-top: 20px;
`;

const EmptyMessageSubLine = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: normal;
  text-align: center;
  margin-top: 10px;
`;

const IdeasList = styled.div`
  margin-left: -13px;
  margin-right: -13px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledIdeaCard = styled(IdeaCard)`
  flex-grow: 0;
  width: calc(100% * (1/3) - 26px);
  margin-left: 13px;
  margin-right: 13px;

  @media (max-width: 1440px) and (min-width: 1279px)  {
    width: calc(100% * (1/3) - 16px);
    margin-left: 8px;
    margin-right: 8px;
  }

  @media (max-width: 1279px) and (min-width: 768px)  {
    width: calc(100% * (1/2) - 26px);
  }

  ${media.smallerThanMinTablet`
    width: 100%;
  `};
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

const ClearFiltersIcon = styled(Icon)`
  flex:  0 0 16px;
  width: 16px;
  height: 16px;
  fill: ${colors.label};
  margin-right: 5px;
  margin-top: -2px;
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
    ${ClearFiltersIcon} {
      fill: #000;
    }

    ${ClearFiltersText} {
      color: #000;
    }
  }
`;

const Spacer = styled.div`
  flex: 1;
`;

const ViewButtons = styled.div`
  display: flex;
  margin-right: 10px;
`;

const ViewButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: transparent;
  border: solid 1px ${({ theme }) => theme.colorText};

  &:not(.active):hover {
    background: ${({ theme }) => rgba(theme.colorText, 0.08)};
  }

  &.active {
    background: ${({ theme }) => theme.colorText};

    > span {
      color: #fff;
    }
  }

  > span {
    color: ${({ theme }) => theme.colorText};
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    line-height: normal;
    padding-left: 18px;
    padding-right: 18px;
    padding-top: 10px;
    padding-bottom: 10px;

    ${media.smallerThanMinTablet`
      padding-top: 9px;
      padding-bottom: 9px;
    `}
  }
`;

const CardsButton = styled(ViewButton)`
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-left-radius: ${(props: any) => props.theme.borderRadius};
  border-right: none;
`;

const MapButton = styled(ViewButton)`
 border-top-right-radius: ${(props: any) => props.theme.borderRadius};
  border-bottom-right-radius: ${(props: any) => props.theme.borderRadius};
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const ShowMoreButton = styled(Button)``;

interface InputProps extends GetIdeasInputProps  {
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: 'Phase' | 'Project' | null;
  className?: string;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
  ideas: GetIdeasChildProps;
  ideasFilterCounts: GetIdeasFilterCountsChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

interface State {
  selectedView: 'card' | 'map';
  filtersModalOpened: boolean;
  selectedIdeaFilters: Partial<IQueryParameters>;
}

class IdeaCards extends PureComponent<Props & InjectedIntlProps, State> {
  static defaultProps = {
    showViewToggle: false
  };

  constructor(props: Props & InjectedIntlProps) {
    super(props);
    this.state = {
      selectedView: (props.defaultView || 'card'),
      filtersModalOpened: false,
      selectedIdeaFilters: get(props.ideas, 'queryParameters', {})
    };
  }

  componentDidUpdate(prevProps: Props) {
    const oldQueryParameters = get(prevProps.ideas, 'queryParameters', null);
    const newQueryParameters = get(this.props.ideas, 'queryParameters', null);

    if (newQueryParameters !== oldQueryParameters) {
      this.setState({ selectedIdeaFilters: get(this.props.ideas, 'queryParameters', {}) });
    }

    if (this.props.phaseId !== prevProps.phaseId) {
      this.setState({ selectedView: this.props.defaultView || 'card' });
    }
  }

  openFiltersModal = () => {
    this.setState({ filtersModalOpened: true });
  }

  closeFiltersModal = () => {
    this.setState({ filtersModalOpened: false });
  }

  loadMore = () => {
    this.props.ideas.onLoadMore();
  }

  handleProjectsOnChange = (projects: string[]) => {
    this.props.ideas.onChangeProjects(projects);
  }

  handleSortOnChange = (sort: Sort) => {
    this.props.ideas.onChangeSorting(sort);
  }

  handleSearchOnChange = (searchTerm: string) => {
    this.props.ideas.onChangeSearchTerm(searchTerm);
  }

  handleIdeaFiltersOnClear = () => {
    this.setState((state) => {
      const selectedIdeaFilters = {
        ...state.selectedIdeaFilters,
        search: null,
        idea_status: null,
        areas: null,
        topics: null
      };

      this.props.ideas.onIdeaFiltering(selectedIdeaFilters);

      return { selectedIdeaFilters };
    });
  }

  handleIdeaFiltersOnChange = (newSelectedIdeaFilters: Partial<IQueryParameters>) => {
    this.setState((state) => {
      const selectedIdeaFilters = {
        ...state.selectedIdeaFilters,
        ...newSelectedIdeaFilters
      };

      this.props.ideas.onIdeaFiltering(selectedIdeaFilters);

      return { selectedIdeaFilters };
    });
  }

  handleMobileIdeaFiltersOnChange = (newSelectedIdeaFilters: Partial<IQueryParameters>) => {
    this.setState(({ selectedIdeaFilters }) => ({
      selectedIdeaFilters: {
        ...selectedIdeaFilters,
        ...newSelectedIdeaFilters
      }
    }));
  }

  handleIdeaFiltersOnApply = () => {
    this.props.ideas.onIdeaFiltering(this.state.selectedIdeaFilters);
    this.closeFiltersModal();
  }

  handleIdeaFiltersOnClose = () => {
    this.closeFiltersModal();
    this.setState({ selectedIdeaFilters: !isNilOrError(this.props.ideas) ? this.props.ideas.queryParameters : {} });
  }

  selectView = (selectedView: 'card' | 'map') => (event: FormEvent<any>) => {
    event.preventDefault();
    trackEventByName(tracks.toggleDisplay, { selectedDisplayMode: selectedView });
    this.setState({ selectedView });
  }

  removeFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  }

  filterMessage = <FormattedMessage {...messages.filter} />;
  searchPlaceholder = this.props.intl.formatMessage(messages.searchPlaceholder);
  searchAriaLabel = this.props.intl.formatMessage(messages.searchPlaceholder);

  render() {
    const { selectedView, selectedIdeaFilters, filtersModalOpened } = this.state;
    const { participationMethod, participationContextId, participationContextType, ideas, ideasFilterCounts, windowSize, className, theme, showViewToggle } = this.props;
    const { queryParameters, ideasList, hasMore, querying, loadingMore } = ideas;
    const hasIdeas = (!isNilOrError(ideasList) && ideasList.length > 0);
    const showCardView = (selectedView === 'card');
    const showMapView = (selectedView === 'map');
    const biggerThanLargeTablet = (windowSize && windowSize >= viewportWidths.largeTablet);
    const filterColumnWidth = (windowSize && windowSize < 1400 ? 340 : 352);

    return (
      <Container id="e2e-ideas-container" className={className}>
        {ideasList === undefined &&
          <InitialLoading id="ideas-loading">
            <Spinner />
          </InitialLoading>
        }

        {ideasList !== undefined &&
          <>
            {!biggerThanLargeTablet &&
              <>
                <FullscreenModal
                  opened={filtersModalOpened}
                  close={this.closeFiltersModal}
                  animateInOut={true}
                  topBar={<FiltersSidebarTopBar />}
                  bottomBar={<FiltersSidebarBottomBar selectedIdeaFilters={selectedIdeaFilters} />}
                >
                  <MobileFiltersSidebarWrapper>
                    <StyledFiltersSidebar
                      selectedIdeaFilters={selectedIdeaFilters}
                      onChange={this.handleMobileIdeaFiltersOnChange}
                      onApply={this.handleIdeaFiltersOnApply}
                      onClose={this.handleIdeaFiltersOnClose}
                    />
                  </MobileFiltersSidebarWrapper>
                </FullscreenModal>

                <MobileSearchFilter
                  placeholder={this.searchPlaceholder}
                  ariaLabel={this.searchAriaLabel}
                  value={selectedIdeaFilters.search || null}
                  onChange={this.handleSearchOnChange}
                />

                <MobileFilterButton
                  style="secondary-outlined"
                  onClick={this.openFiltersModal}
                  icon="filter"
                  text={this.filterMessage}
                  borderColor="#ccc"
                  borderHoverColor="#999"
                />
              </>
            }

            <AboveContent filterColumnWidth={filterColumnWidth}>
              <AboveContentLeft>
                {showViewToggle &&
                  <FeatureFlag name="maps">
                    <ViewButtons className={`${showCardView && 'cardView'}`}>
                      <CardsButton onClick={this.selectView('card')} className={`${showCardView && 'active'}`}>
                        <FormattedMessage {...messages.cards} />
                      </CardsButton>
                      <MapButton onClick={this.selectView('map')} className={`${showMapView && 'active'}`}>
                        <FormattedMessage {...messages.map} />
                      </MapButton>
                    </ViewButtons>
                  </FeatureFlag>
                }

                {!isNilOrError(ideasFilterCounts) &&
                  <IdeasCount>
                    <FormattedMessage {...messages.xIdeas} values={{ ideasCount: ideasFilterCounts.total }} />
                  </IdeasCount>
                }
              </AboveContentLeft>

              <Spacer />

              {!showMapView &&
                <AboveContentRight>
                  <SelectSort onChange={this.handleSortOnChange} />
                </AboveContentRight>
              }
            </AboveContent>

            <Content>
              <ContentLeft>
                {showCardView && !querying && hasIdeas && ideasList &&
                  <IdeasList id="e2e-ideas-list">
                    {ideasList.map((idea) => (
                      <StyledIdeaCard
                        key={idea.id}
                        ideaId={idea.id}
                        participationMethod={participationMethod}
                        participationContextId={participationContextId}
                        participationContextType={participationContextType}
                      />
                    ))}
                  </IdeasList>
                }

                {showCardView && !querying && hasMore &&
                  <Footer>
                    <ShowMoreButton
                      id="e2e-idea-cards-show-more-button"
                      onClick={this.loadMore}
                      style="secondary"
                      text={<FormattedMessage {...messages.showMore} />}
                      processing={loadingMore}
                      height="50px"
                      icon="showMore"
                      iconPos="left"
                      textColor={theme.colorText}
                      textHoverColor={darken(0.1, theme.colorText)}
                      bgColor={rgba(theme.colorText, 0.08)}
                      bgHoverColor={rgba(theme.colorText, 0.12)}
                      fontWeight="500"
                    />
                  </Footer>
                }

                {showCardView && querying &&
                  <Loading id="ideas-loading">
                    <Spinner />
                  </Loading>
                }

                {!querying && !hasIdeas &&
                  <EmptyContainer id="ideas-empty">
                    <EmptyContainerInner>
                      <IdeaIcon name="idea" />
                      <EmptyMessage>
                        <EmptyMessageMainLine><FormattedMessage {...messages.noIdeasForFilter} /></EmptyMessageMainLine>
                        <EmptyMessageSubLine><FormattedMessage {...messages.tryOtherFilter} /></EmptyMessageSubLine>
                      </EmptyMessage>
                    </EmptyContainerInner>
                  </EmptyContainer>
                }

                {showMapView && hasIdeas &&
                  <IdeasMap
                    projectIds={queryParameters.projects}
                    phaseId={queryParameters.phase}
                  />
                }
              </ContentLeft>

              {biggerThanLargeTablet &&
                <ContentRight
                  id="e2e-ideas-filters"
                  filterColumnWidth={filterColumnWidth}
                >
                  {(selectedIdeaFilters.search || selectedIdeaFilters.idea_status || selectedIdeaFilters.areas || selectedIdeaFilters.topics) &&
                    <ClearFiltersButton onMouseDown={this.removeFocus} onClick={this.handleIdeaFiltersOnClear}>
                      {/* <ClearFiltersIcon name="close" /> */}
                      <ClearFiltersText>
                        <FormattedMessage {...messages.clearAll} />
                      </ClearFiltersText>
                    </ClearFiltersButton>
                  }

                  <FiltersSidebar
                    selectedIdeaFilters={selectedIdeaFilters}
                    onChange={this.handleIdeaFiltersOnChange}
                  />
                </ContentRight>
              }
            </Content>
          </>
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize debounce={50} />,
  ideas: ({ render, children, ...getIdeasInputProps }) => <GetIdeas {...getIdeasInputProps} pageSize={12} sort="random">{render}</GetIdeas>,
  ideasFilterCounts: ({ ideas, render }) => <GetIdeasFilterCounts queryParameters={get(ideas, 'queryParameters', null)}>{render}</GetIdeasFilterCounts>
});

const WithFiltersSidebarWithHoCs = withTheme(injectIntl(IdeaCards));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <WithFiltersSidebarWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
