import * as React from 'react';
import { get, isString, isEmpty, omitBy, isNil } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import IdeaCard, { Props as IdeaCardProps } from 'components/IdeaCard';
import IdeasMap from 'components/IdeasMap';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import SelectTopics from './SelectTopics';
import SelectSort from './SelectSort';
import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';
import FeatureFlag from 'components/FeatureFlag';

// services
import { ideasStream, IIdeas } from 'services/ideas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import shallowCompare from 'utils/shallowCompare';
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 300px;
  background: #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: solid 1px #e4e4e4;
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  &.mapView {
    justify-content: flex-end;
  }

  ${media.smallerThanMinTablet`
    margin-bottom: 30px;
  `}
`;

const FilterArea = styled.div`
  display: flex;
  align-items: center;

  ${media.smallerThanMinTablet`
    align-items: left;
  `}
`;

const LeftFilterArea = FilterArea.extend`
  &.hidden {
    display: none;
  }

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const RightFilterArea = FilterArea.extend`
  &.hidden {
    display: none;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
    display: flex;
    justify-content: space-between;
  `}

  ${media.smallerThanMinTablet`
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
  `}
`;

const DropdownFilters = styled.div`
  &.hidden {
    display: none;
  }

  &.hasViewToggle {
    ${media.smallerThanMinTablet`
      margin-top: 20px;
    `}
  }
`;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;

  input {
    font-size: 18px;
    font-weight: 400;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
  `}
`;

const ViewButtons = styled.div`
  display: flex;

  &.cardView {
    margin-left: 30px;

    ${media.smallerThanMinTablet`
      margin-left: 0px;
    `}
  }
`;

const ViewButton = styled.div`
  min-width: 85px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #fff;
  border: solid 1px #e4e4e4;

  &:hover,
  &.active {
    background: #f0f0f0;
  }

  > span {
    color: ${(props) => props.theme.colors.label};
    color: #333;
    font-size: 17px;
    font-weight: 400;
    line-height: 24px;
    padding-left: 15px;
    padding-right: 15px;
  }

  ${media.smallerThanMinTablet`
    height: 44px;
  `}
`;

const CardsButton = ViewButton.extend`
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

const MapButton = ViewButton.extend`
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const IdeasList: any = styled.div`
  margin-left: -13px;
  margin-right: -13px;
  display: flex;
  flex-wrap: wrap;
`;

const StyledIdeaCard = styled<IdeaCardProps>(IdeaCard)`
  flex-grow: 0;
  width: calc(100% * (1/3) - 26px);
  margin-left: 13px;
  margin-right: 13px;

  ${media.smallerThanMaxTablet`
    width: calc(100% * (1/2) - 26px);
  `};

  ${media.smallerThanMinTablet`
    width: 100%;
  `};
`;

const EmptyContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 100px;
  padding-bottom: 100px;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  background: #fff;
`;

const IdeaIcon = styled(Icon)`
  height: 45px;
  fill: #999;
`;

const EmptyMessage = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: #999;
  font-size: 18px;
  font-weight: 400;
  line-height: 22px;
  text-align: center;
`;

const LoadMoreButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const LoadMoreButton = styled(Button)``;

interface IQueryParameters {
  'page[number]'?: number | undefined;
  'page[size]'?: number | undefined;
  project?: string | undefined;
  phase?: string | undefined;
  author?: string | undefined;
  sort?: string | undefined;
  search?: string | undefined;
  topics?: string[] | undefined;
}

interface IAccumulator {
  ideas: IIdeas;
  queryParameters: IQueryParameters;
  hasMore: boolean;
}

type Props = {
  queryParameters?: IQueryParameters | undefined;
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
};

type State = {
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  selectedView: 'card' | 'map';
  ideas: IIdeas | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
};

export default class IdeaCards extends React.PureComponent<Props, State> {
  queryParameters$: Rx.BehaviorSubject<IQueryParameters>;
  selectedView$: Rx.BehaviorSubject<'card' | 'map'>;
  search$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      queryParameters: {
        'page[number]': 1,
        'page[size]': 12,
        sort: 'trending',
        project: undefined,
        phase: undefined,
        author: undefined,
        search: '',
        topics: undefined
      },
      searchValue: undefined,
      selectedView: 'card',
      ideas: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const queryParameters = { ...this.state.queryParameters, ...this.props.queryParameters };
    const startAccumulatorValue: IAccumulator = { queryParameters, ideas: {} as IIdeas, hasMore: false };
    const selectedView = (this.props.defaultView || 'card');

    this.queryParameters$ = new Rx.BehaviorSubject(queryParameters);
    this.search$ = new Rx.BehaviorSubject('');
    this.selectedView$ = new Rx.BehaviorSubject(selectedView);

    const queryParameters$ = this.queryParameters$.distinctUntilChanged((x, y) => shallowCompare(x, y));
    const search$ = this.search$.distinctUntilChanged().do(searchValue => this.setState({ searchValue })).debounceTime(400);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        queryParameters$,
        search$
      )
      .map(([queryParameters, search]) => ({ ...queryParameters, search }))
      .mergeScan<IQueryParameters, IAccumulator>((acc, queryParameters) => {
        const isLoadingMore = (acc.queryParameters['page[number]'] !== queryParameters['page[number]']);
        const search = (isString(queryParameters.search) && !isEmpty(queryParameters.search) ? queryParameters.search : undefined);
        const pageNumber = (isLoadingMore ? queryParameters['page[number]'] : 1);
        const newQueryParameters: IQueryParameters = omitBy({
          ...queryParameters,
          search,
          'page[number]': pageNumber
        }, isNil);

        this.setState({
          querying: !isLoadingMore,
          loadingMore: isLoadingMore,
        });

        return ideasStream({ queryParameters: newQueryParameters }).observable.map((ideas) => {
          const selfLink = get(ideas, 'links.self');
          const lastLink = get(ideas, 'links.last');
          const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

          return {
            queryParameters,
            hasMore,
            ideas: (!isLoadingMore ? ideas : { data: [...acc.ideas.data, ...ideas.data] }) as IIdeas
          };
        });
      }, startAccumulatorValue).subscribe(({ ideas, queryParameters, hasMore }) => {
        this.setState({ ideas, queryParameters, hasMore, querying: false, loadingMore: false });
      }),

      this.selectedView$.subscribe((selectedView) => {
        this.setState({ selectedView });
      })
    ];
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
    const prevProjectId = get(prevProps, 'queryParameters.project');
    const prevPhaseId = get(prevProps, 'queryParameters.phase');
    const prevProjectOrPhaseId = (prevProjectId || prevPhaseId || null);
    const projectId = get(this.props, 'queryParameters.project');
    const phaseId = get(this.props, 'queryParameters.phase');
    const projectOrPhaseId = (projectId || phaseId || null);

    if ((projectOrPhaseId !== prevProjectOrPhaseId) || (this.props.defaultView !== prevProps.defaultView)) {
      const selectedView = (this.props.defaultView || 'card');
      this.selectedView$.next(selectedView);
    }

    if (prevProps.queryParameters !== this.props.queryParameters) {
      this.queryParameters$.next({ ...this.state.queryParameters, ...this.props.queryParameters });
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMore = () => {
    if (!this.state.loadingMore) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        'page[number]': (this.state.queryParameters['page[number]'] as number) + 1
      });
    }
  }

  handleSearchOnChange = (search: string) => {
    this.search$.next(search);
  }

  handleSortOnChange = (sort: string) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      sort
    });
  }

  handleTopicsOnChange = (topics: string[]) => {
    this.queryParameters$.next({
      ...this.state.queryParameters,
      topics
    });
  }

  selectView = (selectedView: 'card' | 'map') => (event: React.FormEvent<any>) => {
    event.preventDefault();
    trackEvent(tracks.toggleDisplay, { selectedDisplayMode: selectedView });
    this.selectedView$.next(selectedView);
  }

  render() {
    const { ideas, queryParameters, searchValue, selectedView, hasMore, querying, loadingMore } = this.state;
    const projectId = queryParameters.project;
    const phaseId = queryParameters.phase;
    const hasIdeas = (ideas !== null && ideas.data.length > 0);
    const showViewToggle = (this.props.showViewToggle || false);
    const showCardView = (selectedView === 'card');
    const showMapView = (selectedView === 'map');

    return (
      <Container id="e2e-ideas-container">
        <FiltersArea id="e2e-ideas-filters" className={`${showMapView && 'mapView'}`}>
          <LeftFilterArea className={`${showMapView && 'hidden'}`}>
            <StyledSearchInput value={(searchValue || '')} onChange={this.handleSearchOnChange} />
          </LeftFilterArea>

          <RightFilterArea>
            <DropdownFilters className={`${showMapView && 'hidden'} ${showViewToggle && 'hasViewToggle'}`}>
              <SelectSort onChange={this.handleSortOnChange} />
              <SelectTopics onChange={this.handleTopicsOnChange} />
            </DropdownFilters>

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
          </RightFilterArea>
        </FiltersArea>

        {showCardView && querying &&
          <Loading id="ideas-loading">
            <Spinner size="32px" color="#666" />
          </Loading>
        }

        {!querying && !hasIdeas &&
          <EmptyContainer id="ideas-empty">
            <IdeaIcon name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage {...messages.noIdea} />
              </EmptyMessageLine>
            </EmptyMessage>
            <IdeaButton
              projectId={this.state.queryParameters.project}
              phaseId={this.state.queryParameters.phase}
            />
          </EmptyContainer>
        }

        {showCardView && !querying && hasIdeas && ideas &&
          <IdeasList id="e2e-ideas-list">
            {ideas.data.map((idea) => (
              <StyledIdeaCard ideaId={idea.id} key={idea.id} />
            ))}
          </IdeasList>
        }

        {showCardView && !querying && hasMore &&
          <LoadMoreButtonWrapper>
            <LoadMoreButton
              onClick={this.loadMore}
              style="secondary"
              size="2"
              text={<FormattedMessage {...messages.loadMore} />}
              processing={loadingMore}
              circularCorners={false}
              fullWidth={true}
              height="60px"
            />
          </LoadMoreButtonWrapper>
        }

        {showMapView && hasIdeas &&
          <IdeasMap project={projectId} phase={phaseId} />
        }
      </Container>
    );
  }
}
