import React, { memo, FormEvent } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import { Icon } from 'cl2-component-library';
import Card from 'components/UI/Card/Compact';
import Avatar from 'components/Avatar';
import StatusBadge from 'components/StatusBadge';
import VoteControl from 'components/VoteControl';
import AssignBudgetControl from 'components/AssignBudgetControl';
import ideaImagePlaceholder from './idea-placeholder.png';

// types
import { ParticipationMethod } from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

// hooks
import useIdea from 'hooks/useIdea';
import useIdeaImage from 'hooks/useIdeaImage';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { FormattedRelative } from 'react-intl';

// utils
import { get } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const BodyWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 8px;
  opacity: 0.7;
`;

const Body = styled.div`
  font-size: ${fontSizes.small}px;
  color: ${colors.label};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Separator = styled.span`
  display: inline-block;
  margin: 0 4px;
`;

const CommentsCount = styled.span<{ hasMargin: boolean }>`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: ${(props) => (props.hasMargin ? '0 24px' : null)};
`;

const CommentIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 8px;
`;

const Footer = styled.footer<{ spaceBetween: boolean }>`
  display: flex;
  ${(props) => props.spaceBetween && 'justify-content: space-between;'};
`;

interface Props {
  ideaId: string;
  className?: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
}

const CompactIdeaCard = memo<Props & InjectedLocalized>(
  ({
    ideaId,
    localize,
    className,
    participationMethod,
    participationContextId,
    participationContextType,
  }) => {
    const idea = useIdea({ ideaId });

    const ideaImage = useIdeaImage({
      ideaId,
      ideaImageId: get(idea, 'relationships.idea_images.data[0].id'),
    });

    const ideaStatusId = get(idea, 'relationships.idea_status.data.id');

    if (isNilOrError(idea)) {
      return null;
    }
    console.log(idea);
    const onCardClick = (event: FormEvent) => {
      event.preventDefault();

      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    };

    const isBudgetingProject = participationMethod === 'budgeting';
    const ideaBudget = idea?.attributes?.budget;

    const projectId = idea?.relationships?.project.data?.id;
    const authorId = idea.relationships.author.data?.id;
    const ideaTitle = localize(idea.attributes.title_multiloc);

    // remove html tags from wysiwyg output
    const bodyText = localize(idea.attributes.body_multiloc)
      .replace(/<[^>]*>?/gm, '')
      .trim();

    const votingDescriptor = idea?.attributes?.action_descriptor?.voting_idea;
    const commentingDescriptor =
      idea?.attributes?.action_descriptor?.commenting_idea;

    const newClassName = [
      className,
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
      .filter((item) => typeof item === 'string' && item !== '')
      .join(' ');

    const disabledAssignBudgetClick = () => {
      // set state ({ showAssignBudgetDisabled: 'assignBudgetDisabled' });
    };

    return (
      <Card
        onClick={onCardClick}
        className={newClassName}
        title={ideaTitle}
        to={`/ideas/${idea.attributes.slug}`}
        image={
          !isNilOrError(ideaImage)
            ? ideaImage.attributes.versions.small
            : ideaImagePlaceholder
        }
        body={
          <BodyWrapper>
            {authorId && <StyledAvatar size="37" userId={authorId} />}
            <Body>
              <strong>
                <FormattedRelative
                  value={idea.attributes.created_at}
                  style="numeric"
                />
                <Separator aria-hidden>&bull;</Separator>
              </strong>
              {bodyText}
            </Body>
          </BodyWrapper>
        }
        footer={
          <Footer spaceBetween={isBudgetingProject}>
            {!isBudgetingProject && (
              <VoteControl
                style="compact"
                ideaId={idea.id}
                size="1"
                ariaHidden={true}
                showDownvote={votingDescriptor?.downvoting_enabled}
              />
            )}
            <CommentsCount hasMargin={!isBudgetingProject}>
              <CommentIcon name="comments" />
              {idea.attributes.comments_count}
            </CommentsCount>
            {!isBudgetingProject && <StatusBadge statusId={ideaStatusId} />}
            {isBudgetingProject &&
              ideaBudget &&
              participationContextId &&
              participationContextType && (
                <AssignBudgetControl
                  view="ideaCard"
                  ideaId={idea.id}
                  participationContextId={participationContextId}
                  participationContextType={participationContextType}
                  openIdea={onCardClick}
                  disabledAssignBudgetClick={disabledAssignBudgetClick}
                  projectId={projectId}
                />
              )}
          </Footer>
        }
      />
    );
  }
);

export default injectLocalize(CompactIdeaCard);
