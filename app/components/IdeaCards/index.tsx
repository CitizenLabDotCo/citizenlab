import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import IdeaCard, { namespace as ideaCardNamespace } from 'components/IdeaCard';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Modal from 'components/UI/Modal';
import IdeasShow from 'containers/IdeasShow';
import { Flex, Box } from 'grid-styled';
import eventEmitter from 'utils/eventEmitter';
import { state, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';
import { ideasStream, ideaStream, IIdeas, IIdeaData } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { ideaImageStream, ideaImagesStream, IIdeaImage, IIdeaImageData } from 'services/ideaImages';
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
  modalIdeaSlug: string | null;
};

export const namespace = 'IdeaCards/index';

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
    this.state$ = state.createStream<State>(namespace, namespace, initialState);
    this.subscriptions = [];
  }

  componentWillMount() {
    const filter = (_.isObject(this.props.filter) && !_.isEmpty(this.props.filter) ? this.props.filter : {});
    this.filterChange$ = new Rx.BehaviorSubject(filter);
    this.loadMore$ = new Rx.BehaviorSubject(false);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      eventEmitter.observe(ideaCardNamespace, 'ideaCardClick').subscribe(({ eventValue }) => {
        const ideaSlug = eventValue;
        this.openModal(ideaSlug);
      }),

      Rx.Observable.combineLatest(
        this.filterChange$,
        this.loadMore$,
        (filter, loadMore) => ({ filter, loadMore })
      ).mergeScan<{filter: object, loadMore: boolean}, IAccumulator>((acc, { filter, loadMore }) => {
        const filterChange = !_.isEqual(acc.filter, filter) || !loadMore;
        const pageNumber = (filterChange ? 1 : acc.pageNumber + 1);

        return ideasStream({
          queryParameters: {
            'page[size]': 9,
            ...filter,
            'page[number]': pageNumber
          }
        }).observable.switchMap((ideas) => {
          const observables = ideas.data.map(idea => {
            const ideaImages = idea.relationships.idea_images.data;
            const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
            const ideaImage$ = (ideaImageId ? ideaImageStream(idea.id, ideaImageId).observable : Rx.Observable.of(null));
            const idea$ = ideaStream(idea.id).observable;
            const user$ = userStream(idea.relationships.author.data.id).observable;
            return Rx.Observable.combineLatest(idea$, ideaImage$, user$).map(data => idea);
          });

          return Rx.Observable.combineLatest(...observables).map(() => ideas);
        }).map((ideas) => ({
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
        this.state$.next({ ideas, hasMore });
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

  closeModal = () => {
    this.state$.next({ modalIdeaSlug: null });
  }

  openModal = (modalIdeaSlug) => {
    this.state$.next({ modalIdeaSlug });
  }

  render() {
    const { ideas, hasMore } = this.state;
    const { loadMoreEnabled } = this.props;
    const showLoadmore = (loadMoreEnabled === true && hasMore === true);

    const loadMore = (showLoadmore ? (
      <LoadMoreButton onClick={this.loadMoreIdeas}>
        <FormattedMessage {...messages.loadMore} />
      </LoadMoreButton>
    ) : null);

    const ideasList = (ideas ? (
      <IdeasList wrap={true} mx={-10}>
        {ideas.data.map((idea) => (
          <Box key={idea.id} w={[1, 1 / 2, 1 / 3]} px={10}>
            <IdeaCard ideaId={idea.id} />
          </Box>
        ))}
        {loadMore}
      </IdeasList>
    ) : null);

    const modal = (ideas ? (
      <Modal opened={!!this.state.modalIdeaSlug} close={this.closeModal} url={`/ideas/${this.state.modalIdeaSlug}`}>
        <IdeasShow location={location} slug={this.state.modalIdeaSlug} />
      </Modal>
    ) : null);

    return (
      <div>
        {ideasList}
        {modal}
      </div>
    );
  }
}
