import React, { memo, FormEvent } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import UserName from 'components/UI/UserName';
import Card from 'components/UI/Card/Compact';
import { Icon } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import FooterWithVoteControl from './FooterWithVoteControl';
import FooterWithBudgetControl from './FooterWithBudgetControl';

// types
import { ParticipationMethod } from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaImage from 'api/idea_images/useIdeaImage';
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';

// utils
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { transparentize } from 'polished';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { timeAgo } from 'utils/dateUtils';
import useLocale from 'hooks/useLocale';
import { IIdea } from 'api/ideas/types';

const BodyWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-left: -4px;
  margin-top: -2px;
  ${isRtl`
    margin-left: 6px;
    margin-right: -4px;
  `}
`;

const Body = styled.div`
  font-size: ${fontSizes.s}px;
  font-weight: 300;
  color: ${colors.textSecondary};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 21px;
  max-height: 42px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const StyledUserName = styled(UserName)`
  font-size: ${fontSizes.s}px;
  font-weight: 500;
  color: ${colors.textSecondary};
  font-weight: 500;
`;

const Separator = styled.span`
  margin-left: 4px;
  margin-right: 4px;
`;

const TimeAgo = styled.span`
  font-weight: 500;
  margin-right: 5px;
`;

const ImagePlaceholderContainer = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${transparentize(0.94, colors.textSecondary)};
`;

const ImagePlaceholderIcon = styled(Icon)`
  width: 80px;
  height: 80px;
  fill: ${transparentize(0.62, colors.textSecondary)};
`;

interface Props {
  ideaId: string;
  className?: string;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
  hideIdeaStatus?: boolean;
}

const IdeaLoading = (props: Props) => {
  const { data: idea } = useIdeaById(props.ideaId);

  if (idea) {
    return <CompactIdeaCard idea={idea} {...props} />;
  }

  return null;
};

interface IdeaCardProps extends Props {
  idea: IIdea;
}

const CompactIdeaCard = memo<IdeaCardProps>(
  ({
    idea,
    className,
    participationMethod,
    participationContextId,
    participationContextType,
    hideImage = false,
    hideImagePlaceholder = false,
    hideIdeaStatus = false,
  }) => {
    const locale = useLocale();
    const localize = useLocalize();
    const { data: project } = useProjectById(
      idea.data.relationships.project.data.id
    );
    const { data: ideaImage } = useIdeaImage(
      idea.data.id,
      idea.data.relationships.idea_images.data?.[0]?.id
    );
    const authorId = idea.data.relationships.author.data?.id;
    const ideaTitle = localize(idea.data.attributes.title_multiloc);
    // remove html tags from wysiwyg output
    const bodyText = localize(idea.data.attributes.body_multiloc)
      .replace(/<[^>]*>?/gm, '')
      .replaceAll('&amp;', '&')
      .trim();

    const getFooter = () => {
      if (project) {
        const commentingEnabled =
          project.data.attributes.action_descriptor.commenting_idea.enabled;
        const projectHasComments = project.data.attributes.comments_count > 0;
        const showCommentCount = commentingEnabled || projectHasComments;

        // the participationMethod checks ensure that the footer is not shown on
        // e.g. /ideas index page because there's no participationMethod
        // passed through to the IdeaCards from there.
        // Should probably have better solution in future.
        if (participationMethod === 'budgeting') {
          return (
            <FooterWithBudgetControl
              idea={idea}
              participationContextId={participationContextId}
              participationContextType={participationContextType}
              showCommentCount={showCommentCount}
            />
          );
        }

        if (participationMethod === 'ideation') {
          return (
            <FooterWithVoteControl
              idea={idea}
              hideIdeaStatus={hideIdeaStatus}
              showCommentCount={showCommentCount}
            />
          );
        }
      }

      return null;
    };

    const onCardClick = (event: FormEvent) => {
      event.preventDefault();

      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.data.id,
        slug: idea.data.attributes.slug,
        type: 'idea',
      });
    };

    return (
      <Card
        onClick={onCardClick}
        className={[className, 'e2e-idea-card']
          .filter((item) => typeof item === 'string' && item !== '')
          .join(' ')}
        title={ideaTitle}
        to={`/ideas/${idea.data.attributes.slug}`}
        image={
          !isNilOrError(ideaImage)
            ? ideaImage.data.attributes.versions.medium
            : null
        }
        imagePlaceholder={
          <ImagePlaceholderContainer>
            <ImagePlaceholderIcon
              name={participationMethod === 'budgeting' ? 'money-bag' : 'idea'}
            />
          </ImagePlaceholderContainer>
        }
        hideImage={hideImage}
        hideImagePlaceholder={hideImagePlaceholder}
        body={
          <BodyWrapper>
            {authorId && (
              <StyledAvatar
                size={36}
                userId={authorId}
                hideIfNoAvatar={true}
                fillColor={transparentize(0.6, colors.textSecondary)}
              />
            )}
            <Body>
              <StyledUserName userId={authorId || null} />
              <Separator aria-hidden>&bull;</Separator>
              {!isNilOrError(locale) && (
                <TimeAgo>
                  {timeAgo(Date.parse(idea.data.attributes.created_at), locale)}
                </TimeAgo>
              )}
              <span aria-hidden> {bodyText}</span>
            </Body>
          </BodyWrapper>
        }
        footer={getFooter()}
      />
    );
  }
);

export default IdeaLoading;
