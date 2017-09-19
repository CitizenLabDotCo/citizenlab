import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { Link } from 'react-router';

// components
import IdeaCard from 'components/IdeaCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';

// services
import { ideasStream, IIdeas } from 'services/ideas';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { Flex, Box } from 'grid-styled';
import { lighten } from 'polished';
import ButtonMixin from 'components/admin/StyleMixins/buttonMixin';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 500px;
  background: red;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledSpinner = styled(Spinner) `
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: solid 1px red;
`;

const IdeasList: any = styled.div`
  margin-left: -10px;
  margin-right: -10px;
  display: flex;
  flex-wrap: wrap;
`;

const LoadMoreButton = styled.button`
  background: rgba(34, 34, 34, 0.05);
  color: #6b6b6b;
  flex: 1 0 100%;
  padding: 1.5rem 0;
  text-align: center;

  :hover{
    background: rgba(34, 34, 34, 0.10);
  }
`;

const EmptyContainer = styled.div`
  align-items: center;
  background: #fff;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  flex: 1;
  font-size: 1.5em;
  justify-content: center;
  margin: 0;
  min-height: 400px;
  padding: 2rem;

  a {
    ${(props) => ButtonMixin(props.theme.colorMain, lighten(0.1, props.theme.colorMain))};
    margin: 1em;
    color: white;

    svg {
      transform: scale(1.5);
    }
  }

  .idea-icon {
    width: 2rem;
    height: 2rem;
    transform: scale(2);
    margin: 0 0 2rem;

    g[fill] {
      fill: #000;
    }
  }
`;

interface IAccumulator {
  pageNumber: number;
  ideas: IIdeas;
  filter: object;
  hasMore: boolean;
}

type Props = {
  filter: { [key: string]: any };
  loadMoreEnabled?: boolean;
};

type State = {
  ideas: IIdeas | null;
  hasMore: boolean;
  loading: boolean;
};

export default class IdeaCards extends React.PureComponent<Props, State> {
  state: State;
  filterChange$: Rx.BehaviorSubject<object>;
  loadMore$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  static defaultProps: Partial<Props> = {
    loadMoreEnabled: true
  };

  constructor() {
    super();
    this.state = {
      ideas: null,
      hasMore: false,
      loading: true
    };
  }

  componentWillMount() {
    const initialState: State = { ideas: null, hasMore: false, loading: true };
    const filter = (_.isObject(this.props.filter) && !_.isEmpty(this.props.filter) ? this.props.filter : {});

    this.filterChange$ = new Rx.BehaviorSubject(filter);
    this.loadMore$ = new Rx.BehaviorSubject(false);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.filterChange$,
        this.loadMore$,
        (filter, loadMore) => ({ filter, loadMore })
      ).mergeScan<{ filter: object, loadMore: boolean }, IAccumulator>((acc, { filter, loadMore }) => {
        const filterChange = !_.isEqual(acc.filter, filter) || !loadMore;
        const pageNumber = (filterChange ? 1 : acc.pageNumber + 1);

        this.setState(state => ({ loading: (filterChange ? true : state.loading) }));

        return ideasStream({
          queryParameters: {
            'page[size]': 9,
            ...filter,
            'page[number]': pageNumber
          }
        }).observable.map((ideas) => ({
          pageNumber,
          filter,
          ideas: (filterChange ? ideas : { data: [...acc.ideas.data, ...ideas.data] }) as IIdeas,
          hasMore: _.has(ideas, 'links.next')
        }));
      }, {
          ideas: {} as IIdeas,
          filter: {},
          pageNumber: 1,
          hasMore: false
        }).subscribe(({ ideas, hasMore }) => {
          this.setState({ ideas, hasMore, loading: false });
        })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;

    if (!_.isEqual(newProps.filter, oldProps.filter)) {
      const filter = (_.isObject(newProps.filter) && !_.isEmpty(newProps.filter) ? newProps.filter : {});
      this.filterChange$.next(filter);
    }
  }

  loadMoreIdeas = () => {
    this.loadMore$.next(true);
  }

  render() {
    const { ideas, hasMore, loading } = this.state;
    const { loadMoreEnabled } = this.props;
    const showLoadmore = (loadMoreEnabled && hasMore);

    const loadingIndicator = (loading ? (
      <Loading>
        <StyledSpinner />
      </Loading>
    ) : null);

    const loadMore = ((!loading && showLoadmore) ? (
      <LoadMoreButton onClick={this.loadMoreIdeas}>
        <FormattedMessage {...messages.loadMore} />
      </LoadMoreButton>
    ) : null);

    const empty = ((!loading && (!ideas || ideas && ideas.data.length === 0)) ? (
      <EmptyContainer>
        <Icon className="idea-icon" name="idea" />
        <FormattedMessage {...messages.empty} />
        <Link to="/ideas/new">
          <Icon name="add_circle" />
          <FormattedMessage {...messages.addIdea} />
        </Link>
      </EmptyContainer>
    ) : null);

    const ideasList = ((!loading && ideas) ? (
      <IdeasList>
        {ideas.data.map((idea) => (
          <Box key={idea.id} w={[1, 1 / 2, 1 / 3]} px={10}>
            <IdeaCard key={idea.id} ideaId={idea.id} />
          </Box>
        ))}
        {loadMore}
      </IdeasList>
    ) : null);

    return (
      <Container>
        {loadingIndicator}
        {empty}
        {ideasList}
      </Container>
    );
  }
}
