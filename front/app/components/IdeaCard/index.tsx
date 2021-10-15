import React, { useState, FormEvent } from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Card from 'components/UI/Card';
import { Icon } from 'cl2-component-library';
import BottomBounceUp from 'components/UI/Card/BottomBounceUp';
import VotingDisabled from 'components/VoteControl/VotingDisabled';
import VoteControl from 'components/VoteControl';
import AssignBudgetControl from 'components/AssignBudgetControl';
import Author from 'components/Author';

// resources
import useIdea from 'hooks/useIdea';
import useIdeaImage from 'hooks/useIdeaImage';
import useUser from 'hooks/useUser';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';
import useLocalize from 'hooks/useLocalize';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';
import FormattedBudget from 'utils/currency/FormattedBudget';

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
`;

const DisabledWrapper = styled.div`
  padding: 22px;
  padding-top: 28px;
`;

export interface Props {
  ideaId: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  className?: string;
}

const IdeaCard = ({
  ideaId,
  participationMethod,
  participationContextId,
  participationContextType,
  className,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const [showVotingDisabled, setShowVotingDisabled] = useState(false);

  const localize = useLocalize();
  const idea = useIdea({ ideaId });
  const ideaImage = !isNilOrError(idea)
    ? useIdeaImage({
        ideaId,
        ideaImageId: idea.relationships.idea_images?.data?.[0].id,
      })
    : null;
  const ideaAuthor = !isNilOrError(idea)
    ? useUser({ userId: idea.relationships.author.data?.id })
    : null;
  const project = !isNilOrError(idea)
    ? useProject({ projectId: idea.relationships.project.data.id })
    : null;
  const phases = !isNilOrError(project) ? usePhases(project.id) : null;

  const onCardClick = (event: FormEvent) => {
    event.preventDefault();

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    }
  };

  const disabledVoteClick = () => {
    setShowVotingDisabled(true);
  };

  if (
    !isNilOrError(idea) &&
    !isNilOrError(project) &&
    !isNilOrError(ideaImage) &&
    !isNilOrError(ideaAuthor)
  ) {
    const votingDescriptor = idea?.attributes?.action_descriptor?.voting_idea;
    const commentingDescriptor =
      idea?.attributes?.action_descriptor?.commenting_idea;
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
    const classNames = [
      className,
      'e2e-idea-card',
      idea?.relationships?.user_vote?.data ? 'voted' : 'not-voted',
      commentingDescriptor && commentingDescriptor.enabled
        ? 'e2e-comments-enabled'
        : 'e2e-comments-disabled',
      idea.attributes.comments_count > 0 ? 'e2e-has-comments' : null,
      votingDescriptor && votingDescriptor.down.enabled
        ? 'e2e-downvoting-enabled'
        : 'e2e-downvoting-disabled',
    ]
      .filter((item) => isString(item) && item !== '')
      .join(' ');
    const commentsCount = idea.attributes.comments_count;

    return (
      <Card
        className={classNames}
        onClick={onCardClick}
        to={`/ideas/${idea.attributes.slug}`}
        imageUrl={ideaImageUrl}
        header={
          participationMethod === 'budgeting' && ideaBudget ? (
            <IdeaBudget>
              <FormattedBudget value={ideaBudget} />
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
            {!showVotingDisabled && (
              <FooterInner>
                {participationMethod === 'ideation' && (
                  <VoteControl
                    styleType="border"
                    ideaId={idea.id}
                    disabledVoteClick={disabledVoteClick}
                    size="3"
                    ariaHidden
                  />
                )}

                {participationMethod === 'budgeting' &&
                  ideaBudget &&
                  participationContextId &&
                  participationContextType && (
                    <AssignBudgetControl
                      view="ideaCard"
                      projectId={projectId}
                      ideaId={idea.id}
                    />
                  )}

                <Spacer aria-hidden />

                <CommentInfo>
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

            {showVotingDisabled && votingDescriptor && projectId && (
              <BottomBounceUp icon="lock-outlined">
                <DisabledWrapper>
                  <VotingDisabled
                    votingDescriptor={votingDescriptor}
                    projectId={projectId}
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
};

export default injectIntl(IdeaCard);
