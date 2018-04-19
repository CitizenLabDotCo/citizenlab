import React from 'react';
import { get } from 'lodash';
import { adopt } from 'react-adopt';
import { Link, browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import BottomBounceUp from './BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import UserName from 'components/UI/UserName';
import Avatar from 'components/Avatar';

// resrources
import GetIdea, { GetIdeaChildProps } from 'utils/resourceLoaders/components/GetIdea';
import GetIdeaImage, { GetIdeaImageChildProps } from 'utils/resourceLoaders/components/GetIdeaImage';
import GetUser, { GetUserChildProps } from 'utils/resourceLoaders/components/GetUser';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import T from 'components/T';
import { FormattedRelative } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { IModalInfo } from 'containers/App';

const IdeaImageContainer: any = styled.div`
  width: 100%;
  height: 115px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IdeaImage: any = styled.img`
  width: 100%;
`;

const IdeaImageOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  opacity: 0.1;
  transition: all 250ms ease-out;
  will-change: opacity;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  padding-top: 15px;
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
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const IdeaAuthorAvatar = styled(Avatar)`
  width: 28px;
  height: 28px;
  margin-right: 6px;
`;

const IdeaAuthorText = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: -1px;

  > span:not(last-child) {
    margin-right: 4px;
  }

  span > span {
    font-weight: 400;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 18px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledVoteControl = styled(VoteControl)``;

const CommentIcon = styled(Icon)`
  fill: ${(props) => props.theme.colors.label};
  height: 21px;
  margin-right: 7px;
  width: 30px;
`;

const CommentCount = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  font-weight: 400;
`;

const CommentInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  &:not(.enabled) {
    opacity: 0.6;
  }
`;

const IdeaContainer = styled(Link)`
  width: 100%;
  height: 365px;
  margin-bottom: 24px;
  cursor: pointer;
  position: relative;

  ${media.biggerThanMaxTablet`
    &::after {
      content: '';
      border-radius: 5px;
      position: absolute;
      z-index: -1;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      box-shadow: 0px 0px 18px rgba(0, 0, 0, 0.12);
      transition: opacity 350ms cubic-bezier(0.19, 1, 0.22, 1);
      will-change: opacity;
    }

    &:hover {
      ${IdeaImageOverlay} {
        opacity: 0;
      }

      &::after {
        opacity: 1;
      }
    }
  `};
`;

const IdeaContainerInner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 5px;
  background: #fff;
  border: solid 1px #e4e4e4;
  position: relative;
  overflow: hidden;
`;

const VotingDisabledWrapper = styled.div`
  padding: 22px;
`;

export interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  ideaImage: GetIdeaImageChildProps;
  ideaAuthor: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showVotingDisabled: 'unauthenticated' | 'votingDisabled' | null;
}

export const namespace = 'components/IdeaCard/index';

class IdeaCard extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showVotingDisabled: null,
    };
  }

  onCardClick = (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();

    const { idea } = this.props;

    if (idea) {
      eventEmitter.emit<IModalInfo>(namespace, 'cardClick', {
        type: 'idea',
        id: idea.id,
        url: `/ideas/${idea.attributes.slug}`
      });
    }
  }

  onAuthorClick = (event: React.FormEvent<MouseEvent>) => {
    const { ideaAuthor } = this.props;

    if (ideaAuthor) {
      event.stopPropagation();
      event.preventDefault();
      browserHistory.push(`/profile/${ideaAuthor.attributes.slug}`);
    }
  }

  unauthenticatedVoteClick = () => {
    this.setState({ showVotingDisabled: 'unauthenticated' });
  }

  disabledVoteClick = () => {
    this.setState({ showVotingDisabled: 'votingDisabled' });
  }

  render() {
    const { idea, ideaImage, ideaAuthor } = this.props;
    const { showVotingDisabled } = this.state;

    if (idea) {
      const ideaImageUrl = (ideaImage ? ideaImage.attributes.versions.medium : null);
      const votingDescriptor = get(idea.relationships.action_descriptor.data, 'voting', null);
      const projectId = idea.relationships.project.data.id;
      const ideaAuthorId = (ideaAuthor ? ideaAuthor.id : null);
      const commentingDescriptor = (idea.relationships.action_descriptor.data.commenting || null);
      const commentingEnabled = idea.relationships.action_descriptor.data.commenting.enabled;

      const className = `${this.props['className']}
        e2e-idea-card
        ${idea.relationships.user_vote && idea.relationships.user_vote.data ? 'voted' : 'not-voted' }
        ${commentingDescriptor && commentingDescriptor.enabled ? 'e2e-comments-enabled' : 'e2e-comments-disabled'}
        ${idea.attributes.comments_count > 0 ? 'e2e-has-comments' : ''}
        ${votingDescriptor && votingDescriptor.enabled ? 'e2e-voting-enabled' : 'e2e-voting-disabled'}
      `;

      return (
        <IdeaContainer onClick={this.onCardClick} to={`/ideas/${idea.attributes.slug}`} className={className}>
          <IdeaContainerInner>

            {ideaImageUrl &&
              <IdeaImageContainer>
                <IdeaImage src={ideaImageUrl} />
                <IdeaImageOverlay />
              </IdeaImageContainer>
            }

            <IdeaContent>
              <IdeaTitle>
                <T value={idea.attributes.title_multiloc} />
              </IdeaTitle>
              <IdeaAuthor>
                {ideaAuthorId && <IdeaAuthorAvatar userId={ideaAuthorId} size="small" hideIfNoAvatar={false} />}
                <IdeaAuthorText>
                  <FormattedRelative value={idea.attributes.published_at} />
                  <FormattedMessage {...messages.byAuthorName} values={{ authorName: <UserName user={ideaAuthor} /> }} />
                </IdeaAuthorText>
              </IdeaAuthor>
            </IdeaContent>

            {!showVotingDisabled &&
              <Footer>
                <StyledVoteControl
                  ideaId={idea.id}
                  unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                  disabledVoteClick={this.disabledVoteClick}
                  size="2"
                />
                <CommentInfo className={`${commentingEnabled && 'enabled'}`}>
                  <CommentIcon name="comments2" />
                  <CommentCount>
                    <span>{idea.attributes.comments_count}</span>
                  </CommentCount>
                </CommentInfo>
              </Footer>
            }

            {showVotingDisabled === 'unauthenticated' &&
              <BottomBounceUp icon="lock-outlined">
                <Unauthenticated />
              </BottomBounceUp>
            }

            {(showVotingDisabled === 'votingDisabled' && votingDescriptor && projectId) &&
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

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImage: ({ ideaId, idea, render }) => <GetIdeaImage ideaId={ideaId} ideaImageId={get(idea, 'relationships.idea_images.data[0].id', null)}>{render}</GetIdeaImage>,
  ideaAuthor: ({ idea, render }) => <GetUser id={get(idea, 'relationships.author.data.id')}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCard {...inputProps} {...dataProps} />}
  </Data>
);
