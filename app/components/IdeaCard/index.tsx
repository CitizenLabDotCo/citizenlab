import React, { PureComponent, FormEvent } from 'react';
import { get, isUndefined, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Card from 'components/UI/Card';
import { Icon } from 'cl2-component-library';
import BottomBounceUp from 'components/UI/Card/BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import AssignBudgetControl from 'components/AssignBudgetControl';
import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';
import Author from 'components/Author';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetTenant';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImage, { GetIdeaImageChildProps } from 'resources/GetIdeaImage';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedNumber, InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// styles
import styled from 'styled-components';
import { fontSizes, colors, isRtl } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// typings
import { IOpenPostPageModalEvent } from 'containers/App';
import {
  ParticipationMethod,
  getInputTerm,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

const IdeaBudget = styled.div`
  color: ${colors.clRed};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
  font-weight: 500;
  padding: 10px 12px;
  margin-top: 15px;
  margin-left: 19px;
  display: inline-block;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px ${colors.clRed2};
  background: rgba(255, 255, 255, 0.9);
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const FooterInner = styled.div`
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 20px;

  ${isRtl`
    flex-direction: row-reverse;
  `}
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

  ${isRtl`
    margin-right: 0;
    margin-left: 6px;
  `}
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

  ${isRtl`
    flex-direction: row-reverse;
 `}

  &:not(.enabled) {
    opacity: 0.71;
  }
`;

const DisabledWrapper = styled.div`
  padding: 22px;
  padding-top: 28px;
`;

export interface InputProps {
  ideaId: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  idea: GetIdeaChildProps;
  ideaImage: GetIdeaImageChildProps;
  ideaAuthor: GetUserChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showVotingDisabled: 'votingDisabled' | null;
  showAssignBudgetDisabled: 'assignBudgetDisabled' | null;
}

class IdeaCard extends PureComponent<
  Props & InjectedLocalized & InjectedIntlProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      showVotingDisabled: null,
      showAssignBudgetDisabled: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { idea } = this.props;
    const prevIdea = prevProps.idea;

    if (!isNilOrError(idea) && !isNilOrError(prevIdea)) {
      const votingEnabled =
        idea.attributes.action_descriptor.voting_idea.enabled;
      const prevVotingEnabled =
        prevIdea.attributes.action_descriptor.voting_idea.enabled;
      const votingDisabledReason =
        idea.attributes.action_descriptor.voting_idea.disabled_reason;
      const prevVotingDisabledReason =
        prevIdea.attributes.action_descriptor.voting_idea.disabled_reason;
      const ideaBudgetingEnabled =
        idea.attributes?.action_descriptor?.budgeting?.enabled;
      const prevIdeaBudgetingEnabled =
        prevIdea.attributes?.action_descriptor?.budgeting?.enabled;
      const ideaBudgetingDisabledReason =
        idea.attributes?.action_descriptor?.budgeting?.disabled_reason;
      const prevIdeaBudgetingDisabledReason =
        prevIdea.attributes?.action_descriptor?.budgeting?.disabled_reason;

      if (
        votingEnabled !== prevVotingEnabled ||
        votingDisabledReason !== prevVotingDisabledReason
      ) {
        this.setState({ showVotingDisabled: null });
      }

      if (
        ideaBudgetingEnabled !== prevIdeaBudgetingEnabled ||
        ideaBudgetingDisabledReason !== prevIdeaBudgetingDisabledReason
      ) {
        this.setState({ showAssignBudgetDisabled: null });
      }
    }
  }

  onCardClick = (event: FormEvent) => {
    event.preventDefault();

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    }
  };

  disabledVoteClick = () => {
    this.setState({ showVotingDisabled: 'votingDisabled' });
  };

  disabledAssignBudgetClick = () => {
    this.setState({ showAssignBudgetDisabled: 'assignBudgetDisabled' });
  };

  render() {
    const {
      idea,
      ideaImage,
      ideaAuthor,
      tenant,
      project,
      phases,
      participationMethod,
      participationContextId,
      participationContextType,
      localize,
      intl: { formatMessage },
    } = this.props;
    const { showVotingDisabled, showAssignBudgetDisabled } = this.state;

    if (
      !isNilOrError(tenant) &&
      !isNilOrError(idea) &&
      !isNilOrError(project) &&
      !isUndefined(ideaImage) &&
      !isUndefined(ideaAuthor)
    ) {
      const votingDescriptor = idea?.attributes?.action_descriptor?.voting_idea;
      const commentingDescriptor =
        idea?.attributes?.action_descriptor?.commenting_idea;
      const budgetingDescriptor =
        idea?.attributes?.action_descriptor?.budgeting;
      const projectId = project.id;
      const ideaTitle = localize(idea.attributes.title_multiloc);
      const processType = project.attributes.process_type;
      const inputTerm = getInputTerm(processType, project, phases);
      const a11y_postTitle = (
        <ScreenReaderOnly>
          {formatMessage(
            getInputTermMessage(inputTerm, {
              idea: messages.a11y_ideaTitle,
              option: messages.a11y_optionTitle,
              project: messages.a11y_projectTitle,
              question: messages.a11y_questionTitle,
              issue: messages.a11y_issueTitle,
              contribution: messages.a11y_contributionTitle,
            })
          )}
        </ScreenReaderOnly>
      );
      const title = (
        <span>
          {a11y_postTitle}
          {ideaTitle}
        </span>
      );
      const ideaAuthorId = !isNilOrError(ideaAuthor) ? ideaAuthor.id : null;
      const ideaBudget = idea?.attributes?.budget;
      const ideaImageUrl = ideaImage?.attributes?.versions?.medium;
      const tenantCurrency = tenant.attributes.settings.core.currency;
      const className = [
        this.props.className,
        'e2e-idea-card',
        idea?.relationships?.user_vote?.data ? 'voted' : 'not-voted',
        commentingDescriptor && commentingDescriptor.enabled
          ? 'e2e-comments-enabled'
          : 'e2e-comments-disabled',
        idea.attributes.comments_count > 0 ? 'e2e-has-comments' : null,
        votingDescriptor && votingDescriptor.downvoting_enabled
          ? 'e2e-downvoting-enabled'
          : 'e2e-downvoting-disabled',
      ]
        .filter((item) => isString(item) && item !== '')
        .join(' ');
      const commentsCount = idea.attributes.comments_count;

      return (
        <Card
          className={className}
          onClick={this.onCardClick}
          to={`/ideas/${idea.attributes.slug}`}
          imageUrl={ideaImageUrl}
          header={
            participationMethod === 'budgeting' && ideaBudget ? (
              <IdeaBudget>
                <FormattedNumber
                  value={ideaBudget}
                  style="currency"
                  currency={tenantCurrency}
                  minimumFractionDigits={0}
                  maximumFractionDigits={0}
                />
              </IdeaBudget>
            ) : undefined
          }
          title={title}
          body={
            <StyledAuthor
              authorId={ideaAuthorId}
              createdAt={idea.attributes.published_at}
              size={34}
            />
          }
          footer={
            <>
              {!showVotingDisabled && !showAssignBudgetDisabled && (
                <FooterInner>
                  {participationMethod !== 'budgeting' && (
                    <VoteControl
                      style="border"
                      ideaId={idea.id}
                      disabledVoteClick={this.disabledVoteClick}
                      size="2"
                      ariaHidden={true}
                      showDownvote={votingDescriptor?.downvoting_enabled}
                    />
                  )}

                  {participationMethod === 'budgeting' &&
                    ideaBudget &&
                    participationContextId &&
                    participationContextType && (
                      <AssignBudgetControl
                        view="ideaCard"
                        ideaId={idea.id}
                        participationContextId={participationContextId}
                        participationContextType={participationContextType}
                        openIdea={this.onCardClick}
                        disabledAssignBudgetClick={
                          this.disabledAssignBudgetClick
                        }
                        projectId={projectId}
                      />
                    )}

                  <Spacer aria-hidden />

                  <CommentInfo
                    className={`${
                      commentingDescriptor && commentingDescriptor.enabled
                        ? 'enabled'
                        : ''
                    }`}
                  >
                    <CommentIcon name="comments" ariaHidden />
                    <CommentCount
                      aria-hidden
                      className="e2e-ideacard-comment-count"
                    >
                      {commentsCount}
                    </CommentCount>
                    <ScreenReaderOnly>
                      <FormattedMessage
                        {...messages.xComments}
                        values={{ commentsCount }}
                      />
                    </ScreenReaderOnly>
                  </CommentInfo>
                </FooterInner>
              )}

              {showVotingDisabled === 'votingDisabled' &&
                votingDescriptor &&
                projectId && (
                  <BottomBounceUp icon="lock-outlined">
                    <DisabledWrapper>
                      <VotingDisabled
                        votingDescriptor={votingDescriptor}
                        projectId={projectId}
                      />
                    </DisabledWrapper>
                  </BottomBounceUp>
                )}

              {showAssignBudgetDisabled === 'assignBudgetDisabled' &&
                budgetingDescriptor &&
                projectId &&
                participationContextId &&
                participationContextType && (
                  <BottomBounceUp icon="lock-outlined">
                    <DisabledWrapper>
                      <AssignBudgetDisabled
                        budgetingDescriptor={budgetingDescriptor}
                        participationContextId={participationContextId}
                        participationContextType={participationContextType}
                      />
                    </DisabledWrapper>
                  </BottomBounceUp>
                )}
            </>
          }
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  idea: ({ ideaId, render }) => <GetIdea ideaId={ideaId}>{render}</GetIdea>,
  ideaImage: ({ ideaId, idea, render }) => (
    <GetIdeaImage
      ideaId={ideaId}
      ideaImageId={get(idea, 'relationships.idea_images.data[0].id')}
    >
      {render}
    </GetIdeaImage>
  ),
  ideaAuthor: ({ idea, render }) => (
    <GetUser id={get(idea, 'relationships.author.data.id')}>{render}</GetUser>
  ),
  project: ({ idea, render }) => {
    return (
      <GetProject
        projectId={
          !isNilOrError(idea) ? idea.relationships.project.data.id : null
        }
      >
        {render}
      </GetProject>
    );
  },
  phases: ({ project, render }) => {
    return (
      <GetPhases projectId={!isNilOrError(project) ? project.id : null}>
        {render}
      </GetPhases>
    );
  },
});

const IdeaCardWithHoC = injectIntl(injectLocalize(IdeaCard));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeaCardWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
