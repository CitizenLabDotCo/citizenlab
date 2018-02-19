import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { has } from 'lodash';

// router
import { Link, browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import BottomBounceUp from './BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import UserName from 'components/UI/UserName';

// services
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';
import { ideaImageStream, IIdeaImage } from 'services/ideaImages';
import { projectByIdStream } from 'services/projects';

// utils
import T from 'components/T';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

// styles
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

// typings
import { IModalInfo } from 'containers/App';
import { Locale } from 'typings';

const IdeaImage: any = styled.img`
  width: 100%;
  height: 135px;
  object-fit: cover;
  overflow: hidden;
`;

const IdeaImagePlaceholder = styled.div`
  width: 100%;
  height: 135px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${color('placeholderBg')};
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
`;

const IdeaAuthor = styled.div`
  color: #84939d;
  font-size: 15px;
  font-weight: 300;
  line-height: 20px;
  margin-top: 13px;
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
  cursor: pointer;
  position: relative;
  background: transparent;

  &::after {
    content: '';
    border-radius: 6px;
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
    transition: opacity 300ms cubic-bezier(0.19, 1, 0.22, 1);
    will-change: opacity;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const IdeaContainerInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  background: #fff;
  position: relative;
  border: solid 1px #e4e4e4;
  overflow: hidden;
`;

const VotingDisabledWrapper = styled.div`
  padding: 22px;
`;

export type Props = {
  ideaId: string;
};

type State = {
  idea: IIdea | null;
  ideaImage: IIdeaImage | null;
  ideaAuthor: IUser | null;
  locale: Locale | null;
  showFooter: 'unauthenticated' | 'votingDisabled' | null;
  loading: boolean;
};

export const namespace = 'components/IdeaCard/index';

class IdeaCard extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      idea: null,
      ideaImage: null,
      ideaAuthor: null,
      locale: null,
      showFooter: null,
      loading: true
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const ideaWithRelationships$ = ideaByIdStream(ideaId).observable.switchMap((idea) => {
      const ideaId = idea.data.id;
      const ideaImages = idea.data.relationships.idea_images.data;
      const ideaImageId = (ideaImages.length > 0 ? ideaImages[0].id : null);
      const idea$ = ideaByIdStream(ideaId).observable;
      const ideaAuthor$ = idea.data.relationships.author.data ? userByIdStream(idea.data.relationships.author.data.id).observable : Rx.Observable.of(null);
      const ideaImage$ = (ideaImageId ? ideaImageStream(ideaId, ideaImageId).observable : Rx.Observable.of(null));
      const project$ = (idea.data.relationships.project && idea.data.relationships.project.data ? projectByIdStream(idea.data.relationships.project.data.id).observable : Rx.Observable.of(null));

      return Rx.Observable.combineLatest(
        idea$,
        ideaImage$,
        ideaAuthor$,
        project$
      ).map(([idea, ideaImage, ideaAuthor]) => {
        return { idea, ideaImage, ideaAuthor };
      });
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        ideaWithRelationships$
      ).subscribe(([locale, { idea, ideaImage, ideaAuthor }]) => {
        this.setState({ idea, ideaImage, ideaAuthor, locale, loading: false });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onCardClick = (event: React.FormEvent<MouseEvent>) => {
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

  onAuthorClick = (event: React.FormEvent<MouseEvent>) => {
    const { ideaAuthor } = this.state;

    if (ideaAuthor) {
      event.stopPropagation();
      event.preventDefault();
      browserHistory.push(`/profile/${ideaAuthor.data.attributes.slug}`);
    }
  }

  unauthenticatedVoteClick = () => {
    this.setState({ showFooter: 'unauthenticated' });
  }

  disabledVoteClick = () => {
    this.setState({ showFooter: 'votingDisabled' });
  }

  render() {
    const { idea, ideaImage, ideaAuthor, locale, showFooter, loading } = this.state;

    if (!loading && idea && locale) {
      const ideaImageUrl = (ideaImage ? ideaImage.data.attributes.versions.medium : null);
      const createdAt = <FormattedRelative value={idea.data.attributes.created_at} />;
      const hasVotingDescriptor = has(idea, 'data.relationships.action_descriptor.data.voting');
      const votingDescriptor = (hasVotingDescriptor ? idea.data.relationships.action_descriptor.data.voting : null);
      const projectId = idea.data.relationships.project.data && idea.data.relationships.project.data.id;

      const commentingDescriptor = idea.data.relationships.action_descriptor.data.commenting || null;

      const className = `${this.props['className']}
        e2e-idea-card
        ${idea.data.relationships.user_vote && idea.data.relationships.user_vote.data ? 'voted' : 'not-voted' }
        ${commentingDescriptor && commentingDescriptor.enabled ? 'e2e-comments-enabled' : 'e2e-comments-disabled'}
        ${idea.data.attributes.comments_count > 0 ? 'e2e-has-comments' : ''}
      `;

      return (
        <IdeaContainer onClick={this.onCardClick} to={`/ideas/${idea.data.attributes.slug}`} className={className}>
          <IdeaContainerInner>
            {ideaImageUrl && <IdeaImage src={ideaImageUrl} />}

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
                {createdAt} <FormattedMessage {...messages.byAuthorName} values={{ authorName: <UserName user={ideaAuthor} /> }} />
              </IdeaAuthor>
            </IdeaContent>

            {!showFooter &&
              <StyledVoteControl
                ideaId={idea.data.id}
                unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                disabledVoteClick={this.disabledVoteClick}
                size="normal"
              />
            }
            {showFooter === 'unauthenticated' &&
              <BottomBounceUp icon="lock-outlined">
                <Unauthenticated />
              </BottomBounceUp>
              }
            {(showFooter === 'votingDisabled' && votingDescriptor) &&
              <BottomBounceUp icon="lock-outlined">
                <VotingDisabledWrapper>
                  <VotingDisabled
                    votingDescriptor={votingDescriptor}
                    projectId={projectId}
                  />
                </VotingDisabledWrapper>
              </BottomBounceUp>
            }
          </IdeaContainerInner>
        </IdeaContainer>
      );
    }

    return null;
  }
}

export default IdeaCard;
