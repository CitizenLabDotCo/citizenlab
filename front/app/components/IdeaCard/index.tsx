import React, { memo, useEffect } from 'react';

// components
import UserName from 'components/UI/UserName';
import Card from 'components/UI/Card/Compact';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import IdeaCardFooter from './IdeaCardFooter';
import FooterWithReactionControl from './FooterWithReactionControl';

// router
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';

// types
import { ParticipationMethod } from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaImage from 'api/idea_images/useIdeaImage';
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { transparentize } from 'polished';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { timeAgo } from 'utils/dateUtils';
import useLocale from 'hooks/useLocale';
import { IIdea } from 'api/ideas/types';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// components
import AssignBudgetControl from 'components/AssignBudgetControl';
import { getCurrentPhase } from 'api/phases/utils';
import usePhases from 'api/phases/usePhases';

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
  hideBody?: boolean;
  goBackMode?: 'browserGoBackButton' | 'goToProject';
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
    hideImage = false,
    hideImagePlaceholder = false,
    hideIdeaStatus = false,
    hideBody = false,
    goBackMode = 'browserGoBackButton',
  }) => {
    const locale = useLocale();
    const localize = useLocalize();
    const { data: project } = useProjectById(
      idea.data.relationships.project.data.id
    );
    const { data: phases } = usePhases(project?.data.id);
    const { data: ideaImage } = useIdeaImage(
      idea.data.id,
      idea.data.relationships.idea_images.data?.[0]?.id
    );
    const currentPhase = phases ? getCurrentPhase(phases?.data) : undefined;
    const authorId = idea.data.relationships?.author?.data?.id || null;
    const authorHash = idea.data.attributes.author_hash;
    const ideaTitle = localize(idea.data.attributes.title_multiloc);
    // remove html tags from wysiwyg output
    const bodyText = localize(idea.data.attributes.body_multiloc)
      .replace(/<[^>]*>?/gm, '')
      .replaceAll('&amp;', '&')
      .trim();
    const [searchParams] = useSearchParams();
    const scrollToCardParam = searchParams.get('scroll_to_card');

    const getInteractions = () => {
      if (project) {
        const projectId = idea.data.relationships.project.data.id;
        const ideaBudget = idea.data.attributes.budget;
        if (participationMethod === 'voting' && ideaBudget) {
          return (
            <Box display="flex" alignItems="center">
              <AssignBudgetControl
                view="ideaCard"
                projectId={projectId}
                ideaId={idea.data.id}
              />
            </Box>
          );
        }
      }
      return null;
    };
    const votingMethod =
      currentPhase?.attributes.voting_method ||
      project?.data.attributes.voting_method;

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
        if (participationMethod === 'voting' && votingMethod === 'budgeting') {
          return (
            <IdeaCardFooter idea={idea} showCommentCount={showCommentCount} />
          );
        }

        if (participationMethod === 'ideation') {
          return (
            <FooterWithReactionControl
              idea={idea}
              hideIdeaStatus={hideIdeaStatus}
              showCommentCount={showCommentCount}
            />
          );
        }
      }

      return null;
    };

    useEffect(() => {
      if (scrollToCardParam && idea.data.id === scrollToCardParam) {
        setTimeout(() => {
          const element = document.getElementById(scrollToCardParam);

          const top =
            (element?.getBoundingClientRect().top ?? 0) + window.scrollY + 80; // navbar

          // TODO this doesnt work for shit

          window.scroll({
            top,
          });
        }, 1500);
      }

      removeSearchParams(['scroll_to_card']);
    }, [scrollToCardParam, idea]);

    const { slug } = idea.data.attributes;
    const params = goBackMode === 'browserGoBackButton' ? '?go_back=true' : '';

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      updateSearchParams({ scroll_to_card: idea.data.id });

      clHistory.push(`/ideas/${slug}${params}`);
    };

    return (
      <Card
        onClick={handleClick}
        to={`/ideas/${idea.data.attributes.slug}`}
        id={idea.data.id}
        className={[className, 'e2e-idea-card']
          .filter((item) => typeof item === 'string' && item !== '')
          .join(' ')}
        title={ideaTitle}
        image={
          !isNilOrError(ideaImage)
            ? ideaImage.data.attributes.versions.medium
            : null
        }
        imagePlaceholder={
          <ImagePlaceholderContainer>
            <ImagePlaceholderIcon
              name={
                participationMethod === 'voting' && votingMethod === 'budgeting'
                  ? 'money-bag'
                  : 'idea'
              }
            />
          </ImagePlaceholderContainer>
        }
        hideImage={hideImage}
        hideImagePlaceholder={hideImagePlaceholder}
        body={
          <BodyWrapper>
            <StyledAvatar
              size={36}
              userId={authorId}
              fillColor={transparentize(0.6, colors.textSecondary)}
              authorHash={authorHash}
            />
            <Body>
              <StyledUserName
                userId={authorId || null}
                anonymous={idea.data.attributes.anonymous}
              />
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
        hideBody={hideBody}
        interactions={getInteractions()}
        footer={getFooter()}
      />
    );
  }
);

export default IdeaLoading;
