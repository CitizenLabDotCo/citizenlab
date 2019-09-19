import React, { PureComponent, FormEvent } from 'react';
import { get, isUndefined, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Card from 'components/UI/Card';
import Icon from 'components/UI/Icon';
import Unauthenticated from 'components/UI/Card/Unauthenticated';
import BottomBounceUp from 'components/UI/Card/BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import AssignBudgetControl from 'components/AssignBudgetControl';
import AssignBudgetDisabled from 'components/AssignBudgetControl/AssignBudgetDisabled';
import Author from 'components/Author';

// services
import { IIdeaData } from 'services/ideas';

// resources
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImage, { GetIdeaImageChildProps } from 'resources/GetIdeaImage';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// typings
import { IOpenPostPageModalEvent } from 'containers/App';
import { ParticipationMethod } from 'services/participationContexts';

const IdeaBudget = styled.div`
  color: ${colors.clRed2};
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

const DisabledWrapper = styled.div`
  padding: 22px;
  padding-top: 28px;
`;

export interface InputProps {
  ideaId: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: 'Phase' | 'Project' | null;
  className?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
  idea: GetIdeaChildProps;
  ideaImage: GetIdeaImageChildProps;
  ideaAuthor: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  showVotingDisabled: 'unauthenticated' | 'votingDisabled' | null;
  showAssignBudgetDisabled: 'unauthenticated' | 'assignBudgetDisabled' | null;
}

class IdeaCard extends PureComponent<Props & InjectedIntlProps & InjectedLocalized, State> {
  constructor(props) {
    super(props);
    this.state = {
      showVotingDisabled: null,
      showAssignBudgetDisabled: null
    };
  }

  onCardClick = (event: FormEvent) => {
    event.preventDefault();

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('IdeaCard', 'cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea'
      });
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
    const { idea, ideaImage, ideaAuthor, tenant, participationMethod, participationContextId, participationContextType, localize } = this.props;
    const { formatMessage } = this.props.intl;
    const { showVotingDisabled, showAssignBudgetDisabled } = this.state;

    if (
      !isNilOrError(tenant) &&
      !isNilOrError(idea) &&
      !isUndefined(ideaImage) &&
      !isUndefined(ideaAuthor)
    ) {
      const votingDescriptor: IIdeaData['attributes']['action_descriptor']['voting'] | null = get(idea, 'attributes.action_descriptor.voting', null);
      const commentingDescriptor: IIdeaData['attributes']['action_descriptor']['commenting'] | null  = get(idea, 'attributes.action_descriptor.commenting', null);
      const budgetingDescriptor: IIdeaData['attributes']['action_descriptor']['budgeting'] | null = get(idea, 'attributes.action_descriptor.budgeting', null);
      const projectId: string | null = get(idea, 'relationships.project.data.id', null);
      const orgName = localize(tenant.attributes.settings.core.organization_name);
      const ideaTitle = localize(idea.attributes.title_multiloc);
      const ideaAuthorId = !isNilOrError(ideaAuthor) ? ideaAuthor.id : null;
      const ideaBudget = idea.attributes.budget;
      const ideaImageUrl: string | null = get(ideaImage, 'attributes.versions.medium', null);
      const ideaImageAltText = orgName && ideaTitle ? formatMessage(messages.imageAltText, { orgName, ideaTitle }) : null;
      const tenantCurrency = tenant.attributes.settings.core.currency;
      const className = [
        this.props.className,
        'e2e-idea-card',
        get(idea, 'relationships.user_vote.data') ? 'voted' : 'not-voted',
        commentingDescriptor && commentingDescriptor.enabled ? 'e2e-comments-enabled' : 'e2e-comments-disabled',
        idea.attributes.comments_count > 0 ? 'e2e-has-comments' : null,
        votingDescriptor && votingDescriptor.enabled ? 'e2e-voting-enabled' : 'e2e-voting-disabled'
      ].filter(item => isString(item) && item !== '').join(' ');

      return (
        <Card
          className={className}
          onClick={this.onCardClick}
          to={`/ideas/${idea.attributes.slug}`}
          imageUrl={ideaImageUrl}
          imageAltText={ideaImageAltText}
          header={
            <>
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
            </>
          }
          title={ideaTitle}
          body={
            <StyledAuthor
              authorId={ideaAuthorId}
              createdAt={idea.attributes.published_at}
              size="34px"
              notALink
            />
          }
          footer={
            <>
              {!showVotingDisabled && !showAssignBudgetDisabled &&
                <FooterInner>
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

                  <CommentInfo className={`${commentingDescriptor && commentingDescriptor.enabled ? 'enabled' : ''}`}>
                    <CommentIcon name="comments" />
                    <CommentCount className="e2e-ideacard-comment-count">
                      <span>{idea.attributes.comments_count}</span>
                    </CommentCount>
                  </CommentInfo>
                </FooterInner>
              }

              {(showVotingDisabled === 'unauthenticated' || showAssignBudgetDisabled === 'unauthenticated') &&
                <BottomBounceUp icon="lock-outlined">
                  <Unauthenticated />
                </BottomBounceUp>
              }

              {showVotingDisabled === 'votingDisabled' && votingDescriptor && projectId &&
                <BottomBounceUp icon="lock-outlined">
                  <DisabledWrapper>
                    <VotingDisabled
                      votingDescriptor={votingDescriptor}
                      projectId={projectId}
                    />
                  </DisabledWrapper>
                </BottomBounceUp>
              }

              {showAssignBudgetDisabled === 'assignBudgetDisabled' && budgetingDescriptor && projectId &&
                <BottomBounceUp icon="lock-outlined">
                  <DisabledWrapper>
                    <AssignBudgetDisabled
                      budgetingDescriptor={budgetingDescriptor}
                      projectId={projectId}
                    />
                  </DisabledWrapper>
                </BottomBounceUp>
              }
            </>
          }
        />
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaImage: ({ ideaId, idea, render }) => <GetIdeaImage ideaId={ideaId} ideaImageId={get(idea, 'relationships.idea_images.data[0].id')}>{render}</GetIdeaImage>,
  ideaAuthor: ({ idea, render }) => <GetUser id={get(idea, 'relationships.author.data.id')}>{render}</GetUser>
});

const IdeaCardWithHoC = injectIntl(injectLocalize(IdeaCard));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCardWithHoC {...inputProps} {...dataProps} />}
  </Data>
);
