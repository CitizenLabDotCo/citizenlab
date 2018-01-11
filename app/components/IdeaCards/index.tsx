import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import IdeaCard from 'components/IdeaCard';
import Icon from 'components/UI/Icon';
import Spinner from 'components/UI/Spinner';
import Button from 'components/UI/Button';

// services
import { ideasStream, IIdeas } from 'services/ideas';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const Loading = styled.div`
  width: 100%;
  height: 200px;
  background: #fff;
  border-radius: 6px;
  border: solid 1px #eee;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IdeasList: any = styled.div`
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

  ${media.smallerThanDesktop`
    width: calc(100% * (1/2) - 26px);
  `};

  ${media.smallerThanMinTablet`
    width: 100%;
  `};
`;

const LoadMore = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

const LoadMoreButton = styled(Button)``;

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding-top: 50px;
  padding-bottom: 50px;
  border-radius: 5px;
  border: solid 1px #eee;
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

interface IAccumulator {
  pageNumber: number;
  ideas: IIdeas;
  filter: object;
  hasMore: boolean;
}

type Props = {
  filter: { [key: string]: any };
  loadMoreEnabled?: boolean | undefined;
};

type State = {
  ideas: IIdeas | null;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
};

class IdeaCards extends React.PureComponent<Props, State> {
  state: State;
  filterChange$: Rx.BehaviorSubject<object>;
  loadMore$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  static defaultProps: Partial<Props> = {
    loadMoreEnabled: true
  };

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideas: null,
      hasMore: false,
      loading: true,
      loadingMore: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
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

        this.setState({ loading: (filterChange), loadingMore: (!filterChange) });

        return ideasStream({
          queryParameters: {
            'page[size]': 15,
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
        this.setState({ ideas, hasMore, loading: false, loadingMore: false });
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

  goToAddIdeaPage = () => {
    browserHistory.push('/ideas/new');
  }

  render() {
    const { ideas, hasMore, loading, loadingMore } = this.state;
    const { loadMoreEnabled } = this.props;
    const showLoadmore = (!!loadMoreEnabled && hasMore);
    const hasIdeas = (ideas !== null && ideas.data.length > 0);

    const loadingIndicator = (loading ? (
      <Loading id="ideas-loading">
        <Spinner size="30px" color="#666" />
      </Loading>
    ) : null);

    const loadMore = ((!loading && hasIdeas && showLoadmore) ? (
      <LoadMore>
        <LoadMoreButton
          text={<FormattedMessage {...messages.loadMore} />}
          processing={loadingMore}
          style="primary"
          size="3"
          onClick={this.loadMoreIdeas}
          circularCorners={false}
        />
      </LoadMore>
    ) : null);

    const empty = ((!loading && !hasIdeas) ? (
      <EmptyContainer id="ideas-empty">
        <IdeaIcon name="idea" />
        <EmptyMessage>
          <EmptyMessageLine>
            <FormattedMessage {...messages.noIdea} />
          </EmptyMessageLine>
        </EmptyMessage>
        <Button
          text={<FormattedMessage {...messages.addIdea} />}
          style="primary"
          size="2"
          icon="plus-circle"
          onClick={this.goToAddIdeaPage}
          circularCorners={true}
        />
      </EmptyContainer>
    ) : null);

    const ideasList = ((!loading && hasIdeas && ideas) ? (
      <React.Fragment>
        <IdeasList id="e2e-ideas-list">
          {ideas.data.map((idea) => (
            <StyledIdeaCard key={idea.id} ideaId={idea.id} />
          ))}
        </IdeasList>
      </React.Fragment>
    ) : null);

    return (
      <Container id="e2e-ideas-container">
        {loadingIndicator}
        {empty}
        {ideasList}
        {loadMore}
      </Container>
    );
  }
}

export default IdeaCards;
