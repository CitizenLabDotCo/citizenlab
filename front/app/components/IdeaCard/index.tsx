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
import useIdea from 'hooks/useIdea';
import useIdeaImage from 'hooks/useIdeaImage';
import useProject from 'hooks/useProject';
import useLocalize from 'hooks/useLocalize';

// i18n
import { FormattedRelative } from 'react-intl';

// utils
import { get } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { transparentize } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

const BodyWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 6px;
  margin-left: -4px;
  margin-top: -2px;
`;

const Body = styled.div`
  font-size: ${fontSizes.small}px;
  font-weight: 300;
  color: ${colors.label};
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
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  color: ${colors.label};
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
  background: ${transparentize(0.94, colors.label)};
`;

const ImagePlaceholderIcon = styled(Icon)`
  width: 34px;
  fill: ${transparentize(0.62, colors.label)};
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

const CompactIdeaCard = memo<Props>(
  ({
    ideaId,
    className,
    participationMethod,
    participationContextId,
    participationContextType,
    hideImage = false,
    hideImagePlaceholder = false,
    hideIdeaStatus = false,
  }) => {
    const localize = useLocalize();
    const idea = useIdea({ ideaId });
    const project = useProject({
      projectId: !isNilOrError(idea)
        ? idea.relationships.project.data.id
        : null,
    });
    const ideaImage = useIdeaImage({
      ideaId,
      ideaImageId: get(idea, 'relationships.idea_images.data[0].id'),
    });

    if (isNilOrError(idea)) {
      return null;
    }

    const authorId = idea.relationships.author.data?.id;
    const ideaTitle = localize(idea.attributes.title_multiloc);
    // remove html tags from wysiwyg output
    const bodyText = localize(idea.attributes.body_multiloc)
      .replace(/<[^>]*>?/gm, '')
      .replaceAll('&amp;', '&')
      .trim();

    const getFooter = () => {
      if (!isNilOrError(project)) {
        const commentingEnabled =
          project.attributes.action_descriptor.commenting_idea.enabled;
        const projectHasComments = project.attributes.comments_count > 0;
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
        id: idea.id,
        slug: idea.attributes.slug,
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
        to={`/ideas/${idea.attributes.slug}`}
        image={
          !isNilOrError(ideaImage) ? ideaImage.attributes.versions.medium : null
        }
        imagePlaceholder={
          <ImagePlaceholderContainer>
            <ImagePlaceholderIcon
              name={participationMethod === 'budgeting' ? 'moneybag' : 'idea'}
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
                fillColor={transparentize(0.6, colors.label)}
              />
            )}
            <Body>
              <StyledUserName userId={authorId || null} />
              <Separator aria-hidden>&bull;</Separator>
              <TimeAgo>
                <FormattedRelative
                  value={idea.attributes.created_at}
                  style="numeric"
                />
              </TimeAgo>
              {bodyText}
            </Body>
          </BodyWrapper>
        }
        footer={getFooter()}
      />
    );
  }
);

export default CompactIdeaCard;
