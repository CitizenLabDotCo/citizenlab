import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import Icon from 'components/UI/Icon';
import VoteControl from 'components/VoteControl';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import { push } from 'react-router-redux';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import { stateStream, IStateStream } from 'services/state';
import { IStream } from 'utils/streams';
import auth from 'services/auth';
import eventEmitter from 'utils/eventEmitter';
import { observeIdea, IIdea } from 'services/ideas';
import { observeUser, IUser } from 'services/users';
import { observeIdeaImages, IIdeaImageData } from 'services/ideaImages';
import { observeLocale } from 'services/locale';
import { namespace as IdeaCardsNamespace } from 'components/IdeaCards';
import styled, { keyframes } from 'styled-components';
import messages from './messages';

const placeholder = require('./img/placeholder.png');

const IdeaContainer: any = styled(Link)`
  width: 100%;
  height: 400px;
  margin: 5px 5px 26px 5px;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: all 250ms ease-out;
  position: relative;

  &:hover {
    box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);
  }
`;

const fadeIn = keyframes`
  0% { display:none ; opacity: 0; }
  1% { display: flex ; opacity: 0; }
  100% { display: flex ; opacity: 1; }
`;

const IdeaHoverBar = styled.div`
  background: rgba(0,0,0,0.65);
  height: 60px;
  position: absolute;
  top: 0;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: #ffffff;
  padding: 20px;
  border-radius: 5px 5px 0 0;

  display: none;
  opacity: 0;

  ${IdeaContainer}:hover & {
    animation: ${fadeIn} 0.15s ease-out;
    display: flex;
    opacity: 1;
  }
`;

const CommentCount = styled.span`
  padding-left: 6px;
`;

const IdeaImage = styled.img`
  width: 100%;
  height: 168px;
  object-fit:cover;
  border-radius: 5px 5px 0 0;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

const IdeaFooter = styled.div`
  padding: 20px;
`;

const IdeaTitle: any = styled.h4`
  color: #222222;
  font-weight: bold;
  /* Multi-line wrap, adapted from https://codepen.io/martinwolf/pen/qlFdp */
  display: block; /* Fallback for non-webkit */
  display: -webkit-box;
  max-width: 400px;
  height: ${(props: any) => props.lines * props.lineHeight * props.fontSize}px; /* Fallback for non-webkit */
  margin: 0 auto;
  font-size: ${(props: any) => props.fontSize}px;
  line-height: ${(props: any) => props.lineHeight};
  -webkit-line-clamp: ${(props: any) => props.lines};
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IdeaAuthor = styled.div`
  color: #6B6B6B;
  font-size: 16px;
  font-weight: 300;
  margin-top: 12px;

  /*
  a {
    color: #6B6B6B;
    &:hover {
      color: #222222;
    }
  }
  */
`;

// We use <span> instead of Link, because the whole card is already
// a Link (more important for SEO) and <a> tags can not be nested
const AuthorLink = styled.span`
  color: #6B6B6B;

  &:hover {
    color: #222222;
  }
`;

type Props = {
  id: string;
};

type State = {
  idea: IIdea | null;
  author: IUser | null;
  isAuthenticated: boolean;
  image: IIdeaImageData | null;
  locale: string | null;
  showUnauthenticated: boolean;
  loading: boolean;
};

export const namespace = 'IdeaCard/index';

export default class IdeaCard extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    const initialState: State = {
      idea: null,
      author: null,
      isAuthenticated: false,
      image: null,
      locale: null,
      showUnauthenticated: false,
      loading: true
    };
    this.state$ = stateStream.observe<State>(namespace, namespace, initialState);
    this.subscriptions = [];
  }

  componentWillMount() {
    const ideaId = this.props.id;

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(
        observeLocale(),
        auth.observeAuthUser().map(authUser => !_.isNull(authUser)),
        observeIdeaImages(ideaId).observable.map(images => (images ? images.data[0] : null)),
        observeIdea(ideaId).observable.switchMap((idea) => {
          const authorId = idea.data.relationships.author.data.id;
          return observeUser(authorId).observable.map(author => ({ idea, author }));
        })
      ).subscribe(([locale, isAuthenticated, image, { idea, author }]) => {
        this.state$.next({ locale, isAuthenticated, image, idea, author, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCardClick = (event) => {
    event.preventDefault();
    eventEmitter.emit(namespace, 'cardClick', this.props.id);
  }

  onAuthorClick = (event) => {
    if (this.state.author) {
      event.stopPropagation();
      event.preventDefault();
      browserHistory.push(`/profile/${this.state.author.data.attributes.slug}`);
    }
  }

  onVoteClick = () => {
    if (!this.state.isAuthenticated) {
      this.state$.next({ showUnauthenticated: true });
    }

    return this.state.isAuthenticated;
  }

  render() {
    const { idea, author, isAuthenticated, image, locale, showUnauthenticated, loading } = this.state;
    const ideaImageUrl = (image ? image.attributes.versions.small : placeholder);
    const authorName = (author ? `${author.data.attributes.first_name} ${author.data.attributes.last_name}` : null);

    return ((!loading && idea && author && locale) ? (
      <IdeaContainer onClick={this.onCardClick} to={`/ideas/${idea.data.attributes.slug}`}>
        <IdeaHoverBar>
          <FormattedRelative value={idea.data.attributes.created_at} />
          <div>
            <Icon name="comment" />
            <CommentCount>{idea.data.attributes.comments_count}</CommentCount>
          </div>
        </IdeaHoverBar>
        <IdeaImage src={ideaImageUrl} />
        <IdeaContent>
          <IdeaTitle lines={2} lineHeight={1.4} fontSize={23}>
            {idea.data.attributes.title_multiloc[locale]}
          </IdeaTitle>
          <IdeaAuthor>
            <FormattedMessage
              {...messages.byAuthorLink}
              values={{
                authorLink: <AuthorLink onClick={this.onAuthorClick}>{authorName}</AuthorLink>,
              }}
            />
          </IdeaAuthor>
        </IdeaContent>
        {!showUnauthenticated &&
          <IdeaFooter>
            <VoteControl ideaId={idea.data.id} beforeVote={this.onVoteClick} />
          </IdeaFooter>
        }
        {showUnauthenticated && <Unauthenticated />}
      </IdeaContainer>
    ) : null);
  }
}
