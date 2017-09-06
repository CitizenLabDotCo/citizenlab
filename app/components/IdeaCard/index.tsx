import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { push } from 'react-router-redux';
import { Link, browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import { namespace as IdeaCardsNamespace } from 'components/IdeaCards';
import VoteControl, { namespace as voteControlNamespace } from 'components/VoteControl';

// services
import { authUserStream } from 'services/auth';
import { state, IStateStream } from 'services/state';
import { localeStream } from 'services/locale';
import { ideaStream, IIdea } from 'services/ideas';
import { userStream, IUser } from 'services/users';
import { ideaImagesStream, ideaImageStream, IIdeaImage, IIdeaImageData } from 'services/ideaImages';

// utils
import T from 'containers/T';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage, FormattedRelative } from 'react-intl';
import messages from './messages';

// styles
import styled, { keyframes } from 'styled-components';

// images
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
  ideaId: string;
};

type State = {
  idea: IIdea | null;
  author: IUser | null;
  isAuthenticated: boolean;
  ideaImage: IIdeaImage | null;
  locale: string | null;
  showUnauthenticated: boolean;
  loading: boolean;
};

export const namespace = 'IdeaCard/index';

export default class IdeaCard extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const { ideaId } = this.props;
    const instanceNamespace = `${namespace}/${ideaId}`;
    const initialState: State = {
      idea: null,
      author: null,
      isAuthenticated: false,
      ideaImage: null,
      locale: null,
      showUnauthenticated: false,
      loading: true
    };

    const locale$ = localeStream().observable;
    const isAuthenticated$ = authUserStream().observable.map(authUser => !_.isNull(authUser));
    const idea$ = ideaStream(ideaId).observable.switchMap((idea) => {
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const authorId = idea.data.relationships.author.data.id;
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));
      const user$ = userStream(authorId).observable;
      return Rx.Observable.combineLatest(ideaImage$, user$).map(([ideaImage, author]) => ({ idea, ideaImage, author }));
    });

    this.state$ = state.createStream<State>(instanceNamespace, instanceNamespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      eventEmitter.observe(voteControlNamespace, 'unauthenticatedVoteClick')
        .filter(({ eventValue }) => eventValue === ideaId)
        .subscribe(() => this.state$.next({ showUnauthenticated: true })),

      Rx.Observable.combineLatest(
        locale$,
        isAuthenticated$,
        idea$
      ).subscribe(([locale, isAuthenticated, { idea, ideaImage, author }]) => {
        this.state$.next({ locale, isAuthenticated, ideaImage, idea, author, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCardClick = (event) => {
    const { idea } = this.state;

    if (idea) {
      event.preventDefault();
      const ideaSlug = idea.data.attributes.slug;
      eventEmitter.emit(namespace, 'ideaCardClick', ideaSlug);
    }
  }

  onAuthorClick = (event) => {
    const { author } = this.state;

    if (author) {
      event.stopPropagation();
      event.preventDefault();
      browserHistory.push(`/profile/${author.data.attributes.slug}`);
    }
  }

  render() {
    const { idea, author, isAuthenticated, ideaImage, locale, showUnauthenticated, loading } = this.state;
    const ideaImageUrl = (ideaImage ? ideaImage.data.attributes.versions.medium : placeholder);
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
            <T value={idea.data.attributes.title_multiloc} />
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
            <VoteControl ideaId={idea.data.id} size="medium" />
          </IdeaFooter>
        }
        {showUnauthenticated && <Unauthenticated />}
      </IdeaContainer>
    ) : null);
  }
}
