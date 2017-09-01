import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import IdeaCard from 'components/IdeaCard';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { mergeJsonApiResources } from 'utils/resources/actions';
import Modal from 'components/UI/Modal';
import IdeasShow from 'containers/IdeasShow';
import { Flex, Box } from 'grid-styled';
import { stateStream, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';
import { observeIdeas, IIdeas, IIdeaData } from 'services/ideas';
import styled from 'styled-components';

const IdeasList: any = styled(Flex)`
  margin-top: 10px;
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

type Props = {
  filter: { [key: string]: any };
  loadMoreEnabled?: boolean;
};

type State = {
  ideas: IIdeaData[] | null;
  hasMore: boolean;
  modalIdeaSlug: string | null;
};

const namespace = 'IdeaCards/index';

export default class IdeaCards extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  filterChange$: Rx.BehaviorSubject<object>;
  loadMore$: Rx.BehaviorSubject<boolean>;
  subscriptions: Rx.Subscription[];

  static defaultProps: Partial<Props> = {
    loadMoreEnabled: true
  };

  constructor() {
    super();
    const initialState: State = {
      ideas: null,
      hasMore: false,
      modalIdeaSlug: null
    };
    this.state$ = stateStream.observe<State>(namespace, namespace, initialState);
    this.loadMore$ = new Rx.BehaviorSubject(false);
    this.subscriptions = [];
  }

  componentWillMount() {
    const filter = (_.isObject(this.props.filter) && !_.isEmpty(this.props.filter) ? this.props.filter : {});
    this.filterChange$ = new Rx.BehaviorSubject(filter);

    this.subscriptions = [
      this.state$.observable.subscribe((state) => {
        this.setState(state);

        // add ideas to redux store
        mergeJsonApiResources(state.ideas);
      }),

      Rx.Observable.combineLatest(
        this.filterChange$,
        this.loadMore$,
        (filter, loadMore) => ({ filter, loadMore })
      ).mergeScan((acc: any, current) => {
        const filterChange = !_.isEqual(acc.filter, current.filter) || !current.loadMore;
        const pageNumber = (filterChange ? 1 : acc.pageNumber + 1);

        return observeIdeas({
          queryParameters: {
            'page[size]': 9,
            ...current.filter,
            'page[number]': pageNumber
          }
        }).observable.map((ideas) => ({
          pageNumber,
          ideas: (filterChange ? ideas.data : [...acc.ideas, ...ideas.data]),
          filter: current.filter,
          hasMore: _.has(ideas, 'links.next')
        }));
      }, {
        ideas: [],
        filter: {},
        pageNumber: 1
      }, 1).subscribe(({ ideas, hasMore }) => {
        this.state$.next({ ideas, hasMore });
      })
    ];
  }

  componentWillReceiveProps(newProps) {
    const oldProps = this.props;

    if (!_.isEqual(newProps.filter, oldProps.filter)) {
      const filter = (_.isObject(newProps.filter) && !_.isEmpty(newProps.filter) ? newProps.filter : {});
      this.filterChange$.next(filter);
    }
  }

  loadMoreIdeas = async () => {
    this.loadMore$.next(true);
  }

  closeModal = () => {
    this.state$.next({ modalIdeaSlug: null });
  }

  openModal = (slug) => {
    this.state$.next({ modalIdeaSlug: slug });
  }

  render() {
    const { ideas, hasMore } = this.state;
    const { loadMoreEnabled } = this.props;

    console.log(ideas);

    const ideasList = ideas && (
      <IdeasList wrap={true} mx={-10}>
        {ideas.map((idea) => {
          const _openModal = () => this.openModal(idea.attributes.slug);

          return (
            <Box key={idea.id} w={[1, 1 / 2, 1 / 3]} px={10}>
              <IdeaCard id={idea.id} onClick={_openModal} />
            </Box>
          );

        })}
        {loadMoreEnabled && hasMore &&
          <LoadMoreButton onClick={this.loadMoreIdeas}>
            <FormattedMessage {...messages.loadMore} />
          </LoadMoreButton>
        }
      </IdeasList>
    );

    const modal = ideas && (
      <Modal
        opened={!!this.state.modalIdeaSlug}
        close={this.closeModal}
        url={`/ideas/${this.state.modalIdeaSlug}`}
      >
        <IdeasShow location={location} slug={this.state.modalIdeaSlug} />
      </Modal>
    );

    return (
      <div>
        {ideasList}
        {/* {modal} */}
      </div>
    );
  }
}
