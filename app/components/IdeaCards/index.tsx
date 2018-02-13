import * as React from 'react';
import { isEqual, get, isString, omitBy, isNil } from 'lodash';
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
  justify-content: flex-end;
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    align-items: flex-end;
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
  will-change: background;

  &:not(.loading) {
    cursor: pointer;

    &:hover {
      background: #e8e8e8;
    }
  }

  &.loading {
    background: #f0f0f0;
  }
`;

interface IFilter {
  'page[size]'?: number | undefined;
  project?: string | undefined;
  phase?: string | undefined;
  author?: string | undefined;
  sort?: string | undefined;
  search?: string | undefined;
  topics?: string[] | undefined;
}

interface IAccumulator {
  pageNumber: number;
  ideas: IIdeas;
  filter: IFilter;
  hasMore: boolean;
}

type Props = {
  filter?: IFilter | undefined;
  theme?: object | undefined;
};

type State = {
  filter: IFilter;
  ideas: IIdeas | null;
  hasMore: boolean;
  querying: boolean;
  loadingMore: boolean;
};

class IdeaCards extends React.PureComponent<Props, State> {
  filter$: Rx.BehaviorSubject<IFilter>;
  loadMore$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      filter: {
        'page[size]': 12,
        project: undefined,
        phase: undefined,
        author: undefined,
        sort: 'trending',
        search: '',
        topics: []
      },
      ideas: null,
      hasMore: false,
      querying: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.filter$ = new Rx.BehaviorSubject({
      ...this.state.filter,
      ...this.props.filter
    });
    this.loadMore$ = new Rx.BehaviorSubject(false);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.filter$.distinctUntilChanged((x, y) => isEqual(x, y)),
        this.loadMore$,
        (filter, loadMore) => ({ filter, loadMore })
      ).mergeScan<{ filter: IFilter, loadMore: boolean }, IAccumulator>((acc, { filter, loadMore }) => {
        const hasFilterChanged = (!isEqual(acc.filter, filter) || !loadMore);
        const pageNumber = (hasFilterChanged ? 1 : acc.pageNumber + 1);

        this.setState({ querying: hasFilterChanged, loadingMore: !hasFilterChanged });

        return ideasStream({
          queryParameters: omitBy({
            'page[size]': 12, // default value
            sort: 'trending', // default value
            ...filter,
            'page[number]': pageNumber
          }, isNil)
        }).observable.map((ideas) => {
          const selfLink = get(ideas, 'links.self');
          const lastLink = get(ideas, 'links.last');
          const hasMore = (isString(selfLink) && isString(lastLink) && selfLink !== lastLink);

          return {
            pageNumber,
            filter,
            hasMore,
            ideas: (hasFilterChanged ? ideas : { data: [...acc.ideas.data, ...ideas.data] }) as IIdeas
          };
        });
      }, {
          ideas: {} as IIdeas,
          filter: {} as IFilter,
          pageNumber: 1,
          hasMore: false
        }).subscribe(({ ideas, filter, hasMore }) => {
          this.setState({ ideas, filter, hasMore, querying: false, loadingMore: false });
        })
    ];
  }

  componentDidUpdate() {
    this.filter$.next({
      ...this.state.filter,
      ...this.props.filter
    });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  loadMoreIdeas = () => {
    if (!this.state.loadingMore) {
      this.loadMore$.next(true);
    }
  }

  handleSearchOnChange = (search: string) => {
    this.filter$.next({
      ...this.state.filter,
      search
    });
  }

  handleSortOnChange = (sort: string) => {
    this.filter$.next({
      ...this.state.filter,
      sort
    });
  }

  handleTopicsOnChange = (topics: string[]) => {
    this.filter$.next({
      ...this.state.filter,
      topics
    });
  }

  render() {
    const theme: any = this.props.theme;
    const { ideas, filter, hasMore, querying, loadingMore } = this.state;
    const { search } = filter;
    const hasIdeas = (ideas !== null && ideas.data.length > 0);

    return (
      <Container id="e2e-ideas-container">
        <FiltersArea id="e2e-ideas-filters">
          <SearchFilterArea>
            <StyledSearchInput value={(search || '')} onChange={this.handleSearchOnChange} />
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
          <LoadMoreButton className={`${loadingMore && 'loading'}`} onClick={this.loadMoreIdeas}>
            {!loadingMore ? <FormattedMessage {...messages.loadMore} /> : <Spinner size="30px" color={theme.colorMain} />}
          </LoadMoreButton>
        }
      </Container>
    );
  }
}

export default withTheme(IdeaCards);
