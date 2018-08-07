import React, { PureComponent, FormEvent } from 'react';
import { get } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import clHistory from 'utils/cl-router/history';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import BottomBounceUp from './BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import Author from 'components/Author';
import LazyImage from 'components/LazyImage';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImage, { GetIdeaImageChildProps } from 'resources/GetIdeaImage';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import T from 'components/T';
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
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

const IdeaImage: any = styled(LazyImage)`
  width: 100%;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  padding-top: 15px;
`;

const IdeaTitle: any = styled.h3`
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
  margin-bottom: .5em;
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
  fill: ${(props) => props.theme.colors.clGrey};
  height: 21px;
  margin-right: 7px;
  width: 30px;
`;

const CommentCount = styled.div`
  color: ${(props) => props.theme.colors.clGrey};
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

    &:hover::after {
      opacity: 1;
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

class IdeaCard extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      showVotingDisabled: null,
    };
  }

  onCardClick = (event: FormEvent<MouseEvent>) => {
    event.preventDefault();

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IModalInfo>(namespace, 'cardClick', {
        type: 'idea',
        id: idea.id,
        url: `/ideas/${idea.attributes.slug}`
      });
    }
  }

  onAuthorClick = (event: FormEvent<MouseEvent>) => {
    const { ideaAuthor } = this.props;

    if (!isNilOrError(ideaAuthor)) {
      event.stopPropagation();
      event.preventDefault();
      clHistory.push(`/profile/${ideaAuthor.attributes.slug}`);
    }
  }

  unauthenticatedVoteClick = () => {
    this.setState({ showVotingDisabled: 'unauthenticated' });
  }

  disabledVoteClick = () => {
    this.setState({ showVotingDisabled: 'votingDisabled' });
  }

  render() {
    const { idea, ideaImage, ideaAuthor, intl: { formatMessage } } = this.props;
    const { showVotingDisabled } = this.state;

    if (!isNilOrError(idea)) {
      const ideaImageUrl = (ideaImage ? ideaImage.attributes.versions.medium : null);
      const votingDescriptor = get(idea.relationships.action_descriptor.data, 'voting', null);
      const projectId = idea.relationships.project.data.id;
      const ideaAuthorId = (!isNilOrError(ideaAuthor) ? ideaAuthor.id : null);
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
              <T value={idea.attributes.title_multiloc}>
                {(ideaTitle) => (<IdeaImage src={ideaImageUrl} alt={formatMessage(messages.imageAltText, { ideaTitle })} />)}
              </T>
              </IdeaImageContainer>
            }

            <IdeaContent>
              <IdeaTitle>
                <T value={idea.attributes.title_multiloc} />
              </IdeaTitle>
              <Author
                authorId={ideaAuthorId}
                createdAt={idea.attributes.published_at}
                size="small"
                message={messages.byAuthorNameComponent}
                notALink
              />
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
  ideaImage: ({ ideaId, idea, render }) => <GetIdeaImage ideaId={ideaId} ideaImageId={!isNilOrError(idea) ? get(idea.relationships.idea_images.data[0], 'id', null) : null}>{render}</GetIdeaImage>,
  ideaAuthor: ({ idea, render }) => <GetUser id={!isNilOrError(idea) ? get(idea.relationships.author.data, 'id', null) : null}>{render}</GetUser>,
});

const IdeaCardWithHoC = injectIntl(IdeaCard);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCardWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
