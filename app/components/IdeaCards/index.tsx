import * as React from 'react';
import { get, isString, isEmpty, omitBy, isNil } from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import IdeaCard, { Props as IdeaCardProps } from 'components/IdeaCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import SelectTopics from './SelectTopics';
import SelectSort from './SelectSort';
import SearchInput from 'components/UI/SearchInput';

// services
import { ideasStream, IIdeas } from 'services/ideas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { withTheme } from 'styled-components';
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

  /* ${media.smallerThanMaxTablet`
    justify-content: center;
  `} */
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    height: 30px;
  `}
`;

const SearchFilterArea = FilterArea.extend`
  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const SelectFilterArea = FilterArea.extend``;

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 120px;
  padding-bottom: 120px;
  border-radius: 5px;
  box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.12);
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

const LoadMoreButton = styled.div`
  flex: 0 0 60px;
  width: 100%;
  height: 60px;
  color: ${(props) => props.theme.colorMain};
  font-size: 18px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  transition: all 100ms ease-out;
  background: #f0f0f0;

  border: solid 2px #eaeaea;
  background: #fff;

  width: 300px;
  flex: 0 0 300px;
  background: #eee;
  border: none;

  ${media.smallerThanMinTablet`
    width: 100%;
    flex: 1;
  `};

  &:not(.loading) {
    cursor: pointer;

    &:hover {
      background: #e0e0e0;
      border-color: #ccc
    }
  }

  &.loading {
    /* background: #f0f0f0; */
  }
`;

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
  theme?: object | undefined;
};

type State = {
  queryParameters: IQueryParameters;
  searchValue: string | undefined;
  ideas: IIdeas | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
};

class IdeaCards extends React.PureComponent<Props, State> {
  queryParameters$: Rx.BehaviorSubject<IQueryParameters>;
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
        search: undefined,
        topics: undefined
      },
      searchValue: undefined,
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

    this.queryParameters$ = new Rx.BehaviorSubject(queryParameters);
    this.search$ = new Rx.BehaviorSubject('');

    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.queryParameters$,
        this.search$.distinctUntilChanged().do(searchValue => this.setState({ searchValue })).debounceTime(400)
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
      })
    ];
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.queryParameters !== this.props.queryParameters) {
      this.queryParameters$.next({
        ...this.state.queryParameters,
        ...this.props.queryParameters
      });
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

  render() {
    const theme: any = this.props.theme;
    const { ideas, searchValue, hasMore, querying, loadingMore } = this.state;
    const hasIdeas = (ideas !== null && ideas.data.length > 0);

    return (
      <Container id="e2e-ideas-container">
        <FiltersArea id="e2e-ideas-filters">
          <SearchFilterArea>
            <StyledSearchInput value={(searchValue || '')} onChange={this.handleSearchOnChange} />
          </SearchFilterArea>

          <SelectFilterArea>
            <SelectSort onChange={this.handleSortOnChange} />
            <SelectTopics onChange={this.handleTopicsOnChange} />
          </SelectFilterArea>
        </FiltersArea>

        {querying &&
          <Loading id="ideas-loading">
            <Spinner size="34px" color="#666" />
          </Loading>
        }

        {(!querying && !hasIdeas) &&
          <EmptyContainer id="ideas-empty">
            <IdeaIcon name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage {...messages.noIdea} />
              </EmptyMessageLine>
            </EmptyMessage>
          </EmptyContainer>
        }

        {(!querying && hasIdeas && ideas) &&
          <IdeasList id="e2e-ideas-list">
            {ideas.data.map((idea) => (
              <StyledIdeaCard ideaId={idea.id} key={idea.id} />
            ))}
          </IdeasList>
        }

        {(!querying && hasMore) &&
          <LoadMoreButtonWrapper>
            <LoadMoreButton className={`${loadingMore && 'loading'}`} onClick={this.loadMore}>
              {!loadingMore ? <FormattedMessage {...messages.loadMore} /> : <Spinner size="30px" color={theme.colorMain} />}
            </LoadMoreButton>
          </LoadMoreButtonWrapper>
        }
      </Container>
    );
  }
}

export default withTheme(IdeaCards);
