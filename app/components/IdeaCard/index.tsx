import React, { PureComponent, FormEvent } from 'react';
import { get, isUndefined } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import clHistory from 'utils/cl-router/history';
import bowser from 'bowser';

// components
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/IdeaCard/Unauthenticated';
import BottomBounceUp from './BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import AssignBudgetControl from 'components/AssignBudgetControl';
import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';
import Author from 'components/Author';
import LazyImage from 'components/LazyImage';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImage, { GetIdeaImageChildProps } from 'resources/GetIdeaImage';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import T from 'components/T';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { IIdeaCardClickEvent } from 'containers/App';
import { ParticipationMethod } from 'services/participationContexts';

const IdeaBudget = styled.div`
  color: ${colors.clRed2};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
  font-weight: 500;
  padding: 10px 12px;
  position: absolute;
  top: 15px;
  left: 19px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.clRed2};
  background: rgba(255, 255, 255, 0.9);
`;

const IdeaImageContainer: any = styled.div`
  width: 100%;
  height: 115px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
 border-top-left-radius: ${(props: any) => props.theme.borderRadius};
 border-top-right-radius: ${(props: any) => props.theme.borderRadius};
`;

const IdeaImage = styled(LazyImage)`
  width: 100%;
`;

const IdeaContent = styled.div`
  flex-grow: 1;
  padding: 20px;
  padding-top: 18px;

  &.extraTopPadding {
    padding-top: 75px;
  }
`;

const IdeaTitle: any = styled.h3`
  color: #333;
  display: block;
  display: -webkit-box;
  max-width: 400px;
  margin: 0;
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 26px;
  max-height: 78px;
  margin-bottom: 13px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const Footer = styled.div`
  min-height: 50px;
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Spacer = styled.div`
  flex: 1;
`;

const CommentIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  fill: ${colors.label};
  margin-right: 6px;
  margin-top: 2px;
`;

const CommentCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
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
  height: 375px;
  margin-bottom: 24px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #fff;
  position: relative;
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);

  &.desktop {
    transition: all 200ms ease;

    &:hover {
      box-shadow: 0px 0px 20px 0px rgba(0, 0, 0, 0.12);
      transform: translate(0px, -2px);
    }
  }
`;

const VotingDisabledWrapper = styled.div`
  padding: 22px;
  padding-top: 28px;
`;

const AssignBudgetDisabledWrapper = styled.div`
  padding: 22px;
  padding-top: 28px;
`;

export interface InputProps {
  ideaId: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: 'Phase' | 'Project' | null;
}

interface DataProps {
  tenant: GetTenantChildProps;
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
  ideaImage: GetIdeaImageChildProps;
  ideaAuthor: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showVotingDisabled: 'unauthenticated' | 'votingDisabled' | null;
  showAssignBudgetDisabled: 'unauthenticated' | 'assignBudgetDisabled' | null;
}

export const componentName = 'components/IdeaCard/index';

class IdeaCard extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      showVotingDisabled: null,
      showAssignBudgetDisabled: null
    };
  }

  onCardClick = (event: FormEvent<any>) => {
    event.preventDefault();

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IIdeaCardClickEvent>('IdeaCard', 'ideaCardClick', { ideaId: idea.id, ideaSlug: idea.attributes.slug });
    }
  }

  onCardHover = (event: FormEvent<MouseEvent>) => {
    event.preventDefault();
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

  unauthenticatedAssignBudgetClick = () => {
    this.setState({ showAssignBudgetDisabled: 'unauthenticated' });
  }

  disabledAssignBudgetClick = () => {
    this.setState({ showAssignBudgetDisabled: 'assignBudgetDisabled' });
  }

  render() {
    const {
      idea,
      ideaImage,
      ideaAuthor,
      tenant,
      locale,
      authUser,
      participationMethod,
      participationContextId,
      participationContextType,
      intl: { formatMessage }
    } = this.props;
    const { showVotingDisabled, showAssignBudgetDisabled } = this.state;

    if (
      !isNilOrError(tenant) &&
      !isNilOrError(locale) &&
      !isUndefined(authUser) &&
      !isNilOrError(idea) &&
      !isUndefined(ideaImage) &&
      !isUndefined(ideaAuthor)
    ) {
      const ideaImageUrl: string | null = get(ideaImage, 'attributes.versions.medium', null);
      const votingDescriptor = get(idea, 'relationships.action_descriptor.data.voting', null);
      const budgetingDescriptor = get(idea, 'relationships.action_descriptor.data.budgeting', null);
      const projectId = get(idea, 'relationships.project.data.id');
      const ideaAuthorId = (!isNilOrError(ideaAuthor) ? ideaAuthor.id : null);
      const ideaBudget = idea.attributes.budget;
      const tenantCurrency = tenant.attributes.settings.core.currency;
      const commentingDescriptor = get(idea, 'relationships.action_descriptor.data.commenting');
      const commentingEnabled = get(idea, 'relationships.action_descriptor.data.commenting.enabled');
      const className = `${this.props['className']}
        e2e-idea-card
        ${get(idea, 'relationships.user_vote.data') ? 'voted' : 'not-voted' }
        ${commentingDescriptor && commentingDescriptor.enabled ? 'e2e-comments-enabled' : 'e2e-comments-disabled'}
        ${idea.attributes.comments_count > 0 ? 'e2e-has-comments' : ''}
        ${votingDescriptor && votingDescriptor.enabled ? 'e2e-voting-enabled' : 'e2e-voting-disabled'}
      `;

      return (
        <IdeaContainer
          onMouseOver={this.onCardHover}
          onClick={this.onCardClick}
          to={`/ideas/${idea.attributes.slug}`}
          className={`${className} ${!(bowser.mobile || bowser.tablet) ? 'desktop' : 'mobile'}`}
        >
            {ideaImageUrl &&
              <IdeaImageContainer>
                <T value={idea.attributes.title_multiloc}>
                  {(ideaTitle) => (<IdeaImage src={ideaImageUrl} alt={formatMessage(messages.imageAltText, { ideaTitle })} />)}
                </T>
              </IdeaImageContainer>
            }

            {participationMethod === 'budgeting' && ideaBudget &&
              <IdeaBudget>
                <FormattedNumber
                  value={ideaBudget}
                  style="currency"
                  currency={tenantCurrency}
                  minimumFractionDigits={0}
                  maximumFractionDigits={0}
                />
              </IdeaBudget>
            }

            <IdeaContent className={(ideaImageUrl === null && participationMethod === 'budgeting' && ideaBudget) ? 'extraTopPadding' : ''}>
              <IdeaTitle>
                <T value={idea.attributes.title_multiloc} />
              </IdeaTitle>
              <StyledAuthor
                authorId={ideaAuthorId}
                message={messages.byAuthorName}
                createdAt={idea.attributes.published_at}
                size="34px"
                notALink
              />
            </IdeaContent>

            {!showVotingDisabled &&
              <Footer>
                {participationMethod !== 'budgeting' &&
                  <VoteControl
                    ideaId={idea.id}
                    unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                    disabledVoteClick={this.disabledVoteClick}
                    size="2"
                  />
                }

                {participationMethod === 'budgeting' && ideaBudget && participationContextId && participationContextType &&
                  <AssignBudgetControl
                    view="ideaCard"
                    ideaId={idea.id}
                    participationContextId={participationContextId}
                    participationContextType={participationContextType}
                    openIdea={this.onCardClick}
                    unauthenticatedAssignBudgetClick={this.unauthenticatedAssignBudgetClick}
                    disabledAssignBudgetClick={this.disabledAssignBudgetClick}
                  />
                }

                <Spacer />

                <CommentInfo className={`${commentingEnabled && 'enabled'}`}>
                  <CommentIcon name="comments" />
                  <CommentCount className="e2e-ideacard-comment-count">
                    <span>{idea.attributes.comments_count}</span>
                  </CommentCount>
                </CommentInfo>
              </Footer>
            }

            {(showVotingDisabled === 'unauthenticated' || showAssignBudgetDisabled === 'unauthenticated') &&
              <BottomBounceUp icon="lock-outlined">
                <Unauthenticated />
              </BottomBounceUp>
            }

            {showVotingDisabled === 'votingDisabled' && votingDescriptor && projectId &&
              <BottomBounceUp icon="lock-outlined">
                <VotingDisabledWrapper>
                  <VotingDisabled
                    votingDescriptor={votingDescriptor}
                    projectId={projectId}
                  />
                </VotingDisabledWrapper>
              </BottomBounceUp>
            }

            {showAssignBudgetDisabled === 'assignBudgetDisabled' && budgetingDescriptor && projectId &&
              <BottomBounceUp icon="lock-outlined">
                <AssignBudgetDisabledWrapper>
                  <AssignBudgetDisabled
                    budgetingDescriptor={budgetingDescriptor}
                    projectId={projectId}
                  />
                </AssignBudgetDisabledWrapper>
              </BottomBounceUp>
            }
        </IdeaContainer>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImage: ({ ideaId, idea, render }) => {
    const ideaImageData = !isNilOrError(idea) ? get(idea, 'relationships.idea_images.data') : null;
    const ideaImageImage = Array.isArray(ideaImageData) && ideaImageData.length > 0
      ? ideaImageData[0]
      : null;
    const ideaImageId = ideaImageImage && ideaImageImage.id;

    return (
      <GetIdeaImage
        ideaId={ideaId}
        ideaImageId={ideaImageId ? ideaImageId : null}
      >
        {render}
      </GetIdeaImage>
    );
  },
  ideaAuthor: ({ idea, render }) => <GetUser id={!isNilOrError(idea) ? get(idea, 'relationships.author.data.id', null) : null}>{render}</GetUser>
});

const IdeaCardWithHoC = injectIntl(IdeaCard);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCardWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
