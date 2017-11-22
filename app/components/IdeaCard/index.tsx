import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import VoteControl from 'components/VoteControl';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';

// utils
import T from 'components/T';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// styles
import styled, { keyframes } from 'styled-components';

// typings
import { IModalInfo } from 'containers/App';

const IdeaImage: any = styled.img`
  width: 100%;
  height: 135px;
  object-fit: cover;
  overflow: hidden;
`;

const IdeaImageLarge = styled.img`
  display: none;
`;

const IdeaImagePlaceholder = styled.div`
  width: 100%;
  height: 135px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.colors.placeholderBg};
`;

const CommentCount = styled.span`
  padding-left: 6px;
`;

const IdeaImagePlaceholderIcon = styled(Icon) `
  height: 50px;
  fill: #fff;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
`;

const IdeaTitle: any = styled.h4`
  color: #333;
  display: block;
  display: -webkit-box;
  max-width: 400px;
  max-height: 60px;
  margin: 0;
  font-size: 22px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 26px;
  max-height: 78px;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
`;

const IdeaAuthor = styled.div`
  color: #84939d;
  font-size: 14px;
  font-weight: 300;
  line-height: 20px;
  margin-top: 12px;

  .deleted-user {
    font-style: italic;
  }
`;

const AuthorLink = styled.div`
  color: #333;

  &:hover {
    color: #333;
    text-decoration: underline;
  }
`;

const StyledVoteControl = styled(VoteControl)`
  position: absolute;
  bottom: 20px;
  left: 20px;
`;

const IdeaContainer: any = styled(Link)`
  width: 100%;
  height: 370px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  position: relative;
  border: solid 1px #e4e4e4;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transition: box-shadow 300ms cubic-bezier(0.19, 1, 0.22, 1);
  transform: translate3d(0, 0, 0);
  will-change: box-shadow;

  &:hover {
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
  }
`;

type Props = {
  ideaId: string;
};

type State = {
  idea: IIdea | null;
  ideaImage: IIdeaImage | null;
  ideaAuthor: IUser | null;
  locale: string | null;
  showUnauthenticated: boolean;
  loading: boolean;
};

export const namespace = 'components/IdeaCard/index';

class IdeaCard extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      idea: null,
      ideaImage: null,
      ideaAuthor: null,
      locale: null,
      showUnauthenticated: false,
      loading: true
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const ideaWithMeta$ = ideaByIdStream(ideaId).observable.switchMap((idea) => {
      const ideaId = idea.data.id;
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const idea$ = ideaByIdStream(ideaId).observable;
      const ideaAuthor$ = idea.data.relationships.author.data ? userByIdStream(idea.data.relationships.author.data.id).observable : Rx.Observable.of(null);
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));

      return Rx.Observable.combineLatest(
        idea$,
        ideaImage$,
        ideaAuthor$
      ).map(([idea, ideaImage, ideaAuthor]) => {
        return { idea, ideaImage, ideaAuthor };
      });
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        ideaWithMeta$
      ).subscribe(([locale, { idea, ideaImage, ideaAuthor }]) => {
        this.setState({ idea, ideaImage, ideaAuthor, locale, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCardClick = (event) => {
    event.preventDefault();

    const { idea } = this.state;

    if (idea) {
      eventEmitter.emit<IModalInfo>(namespace, 'cardClick', {
        type: 'idea',
        id: idea.data.id,
        url: `/ideas/${idea.data.attributes.slug}`
       });
    }
  }

  onAuthorClick = (event) => {
    const { ideaAuthor } = this.state;

    if (ideaAuthor) {
      event.stopPropagation();
      event.preventDefault();
      browserHistory.push(`/profile/${ideaAuthor.data.attributes.slug}`);
    }
  }

  unauthenticatedVoteClick = () => {
    this.setState({ showUnauthenticated: true });
  }

  render() {
    const { formatMessage, formatHTMLMessage, formatRelative } = this.props.intl;
    const { idea, ideaImage, ideaAuthor, locale, showUnauthenticated, loading } = this.state;

    if (!loading && idea && locale) {
      const ideaImageUrl = (ideaImage ? ideaImage.data.attributes.versions.medium : null);
      const ideaImageLargeUrl = (ideaImage ? ideaImage.data.attributes.versions.large : null);
      const authorName = ideaAuthor && `${ideaAuthor.data.attributes.first_name} ${ideaAuthor.data.attributes.last_name}`;
      const createdAt = formatRelative(idea.data.attributes.created_at);
      const byAuthor = authorName ? formatMessage(messages.byAuthorName, { authorName }) : formatMessage(messages.byDeletedUser, { deletedUser: `<span class="deleted-user">${formatMessage(messages.deletedUser)}</span>` });
      const className = `${this.props['className']} e2e-idea-card ${idea.data.relationships.user_vote && idea.data.relationships.user_vote.data ? 'voted' : 'not-voted' }`;

      return (
        <IdeaContainer onClick={this.onCardClick} to={`/ideas/${idea.data.attributes.slug}`} className={className}>

          {ideaImageUrl && <IdeaImage src={ideaImageUrl} />}

          {ideaImageLargeUrl && <IdeaImageLarge src={ideaImageLargeUrl} />}

          {!ideaImageUrl &&
            <IdeaImagePlaceholder>
              <IdeaImagePlaceholderIcon name="idea" />
            </IdeaImagePlaceholder>
          }

          <IdeaContent>
            <IdeaTitle>
              <T value={idea.data.attributes.title_multiloc} />
            </IdeaTitle>
            <IdeaAuthor>
              {createdAt} <span dangerouslySetInnerHTML={{ __html: byAuthor }} />
            </IdeaAuthor>
          </IdeaContent>

          {!showUnauthenticated &&
            <StyledVoteControl ideaId={idea.data.id} unauthenticatedVoteClick={this.unauthenticatedVoteClick} />
          }

          {showUnauthenticated && <Unauthenticated />}

        </IdeaContainer>
      );
    }

    return null;
  }
}

export default injectIntl<Props>(IdeaCard);
