import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import CloseIconButton from 'components/UI/CloseIconButton';
import {
  Icon,
  useWindowSize,
  Box,
  defaultCardStyle,
  fontSizes,
  colors,
  viewportWidths,
} from '@citizenlab/cl2-component-library';

// router
import clHistory from 'utils/cl-router/history';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'api/phases/usePhase';

// i18n
import T from 'components/T';
import FormattedBudget from 'utils/currency/FormattedBudget';
import messages from './messages';

// config
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';

// styling
import styled from 'styled-components';

import { darken } from 'polished';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// typings
import { IIdeaData } from 'api/ideas/types';

const Container = styled.div`
  text-align: left;
  padding: 20px;
  margin: 0;
  margin-bottom: 15px;
  cursor: pointer;
  position: relative;
  ${defaultCardStyle}
  border: solid 1px #ccc;

  &:hover,
  &.hover {
    border-color: #000;
  }
`;

const StyledCloseIconButton = styled(CloseIconButton)`
  position: absolute;
  top: 10px;
  right: 10px;
  background: ${colors.grey200};
  padding: 7px 8px;
  border-radius: ${({ theme }) => theme.borderRadius};

  &:hover {
    background: ${darken(0.1, colors.grey200)};
  }
`;

const Title = styled.h3<{ height: string }>`
  height: ${({ height }) => height};
  max-height: ${({ height }) => height};
  color: ${(props) => props.theme.colors.tenantText};
  font-size: 18px;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 23px;
  padding: 0;
  margin: 0;
  margin-bottom: 20px;
  overflow: hidden;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

const MoneybagIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
`;

const DislikeIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  transform: translate(0, 2px);
`;

const LikeIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
`;

const CommentIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  transform: translate(0, 2px);
`;

const FooterValue = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s + 1}px;
  line-height: normal;
  font-weight: 400;
`;

interface Props {
  idea: IIdeaData;
  onSelectIdea: (ideaId: string | null) => void;
  onClose?: () => void;
  className?: string;
  projectId: string;
  phaseId?: string;
  hovered?: boolean;
}

const IdeaMapCard = memo<Props>(
  ({ idea, onClose, className, projectId, phaseId, onSelectIdea, hovered }) => {
    const { data: appConfig } = useAppConfiguration();
    const { data: phase } = usePhase(phaseId || null);
    const { data: project } = useProjectById(projectId);
    const { windowWidth } = useWindowSize();
    const tablet = windowWidth <= viewportWidths.tablet;
    const phaseData = phase?.data;

    const votingMethodConfig = getVotingMethodConfig(
      phaseData?.attributes.voting_method
    );
    const isVotingPhase = !!votingMethodConfig;
    const isParticipatoryBudgetPhase =
      phaseData?.attributes.voting_method === 'budgeting';

    const handleOnClick = (event: React.FormEvent) => {
      event?.preventDefault();
      updateSearchParams({ idea_map_id: idea.id });

      if (tablet) {
        clHistory.push(`/ideas/${idea.attributes.slug}?go_back=true`, {
          scrollToTop: true,
        });
      } else {
        onSelectIdea(idea.id);
      }
    };

    const handleOnKeyPress = (event: React.KeyboardEvent) => {
      if (event?.['key'] === 'Enter') {
        handleOnClick(event);
      }
    };

    const handleCloseButtonClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      onClose?.();
    };

    if (!isNilOrError(appConfig) && !isNilOrError(idea) && project) {
      const tenantCurrency = appConfig.data.attributes.settings.core.currency;
      const ideaBudget = idea.attributes?.budget;
      const reactingActionDescriptor =
        project.data.attributes.action_descriptor.reacting_idea;

      const showDislike =
        reactingActionDescriptor.down.enabled === true ||
        (reactingActionDescriptor.down.enabled === false &&
          reactingActionDescriptor.down.disabled_reason !==
            'reacting_dislike_disabled');

      const commentingEnabled =
        project.data.attributes.action_descriptor.commenting_idea.enabled;
      const projectHasComments = project.data.attributes.comments_count > 0;
      const showCommentCount = commentingEnabled || projectHasComments;
      const phaseButNotCurrentPhase =
        phaseData &&
        pastPresentOrFuture([
          phaseData.attributes.start_at,
          phaseData.attributes.end_at,
        ]) !== 'present';
      const showVoteInput =
        votingMethodConfig && phase?.data && !phaseButNotCurrentPhase;

      return (
        <Container
          className={`${className || ''} ${hovered ? 'hover' : ''}`}
          onClick={handleOnClick}
          onKeyPress={handleOnKeyPress}
          role="button"
          tabIndex={0}
          id="e2e-idea-map-card"
        >
          {tablet && (
            <StyledCloseIconButton
              iconWidth={'12px'}
              iconHeight={'12px'}
              onClick={handleCloseButtonClick}
              a11y_buttonActionMessage={messages.a11y_hideIdeaCard}
              iconColor={darken(0.1, colors.textSecondary)}
              iconColorOnHover={darken(0.2, colors.textSecondary)}
            />
          )}
          <Title height={showVoteInput ? '28px' : '44px'}>
            <T value={idea.attributes.title_multiloc} />
          </Title>
          {showVoteInput && phaseData && (
            <Box mb="20px">
              {votingMethodConfig.getIdeaCardVoteInput({
                ideaId: idea.id,
                phase: phaseData,
              })}
            </Box>
          )}
          <Box display="flex" alignItems="center">
            {isParticipatoryBudgetPhase &&
              tenantCurrency &&
              ideaBudget &&
              !showVoteInput && (
                <FooterItem>
                  <MoneybagIcon name="coin-stack" />
                  <FooterValue>
                    <FormattedBudget value={ideaBudget} />
                  </FooterValue>
                </FooterItem>
              )}
            {!isParticipatoryBudgetPhase &&
              !isVotingPhase &&
              reactingActionDescriptor.enabled && (
                <>
                  <FooterItem>
                    <LikeIcon name="vote-up" />
                    <FooterValue id="e2e-map-card-like-count">
                      {idea.attributes.likes_count}
                    </FooterValue>
                  </FooterItem>

                  {showDislike && (
                    <FooterItem>
                      <DislikeIcon name="vote-down" />
                      <FooterValue id="e2e-map-card-dislike-count">
                        {idea.attributes.dislikes_count}
                      </FooterValue>
                    </FooterItem>
                  )}
                </>
              )}
            {showCommentCount && (
              <FooterItem>
                <CommentIcon name="comments" />
                <FooterValue>{idea.attributes.comments_count}</FooterValue>
              </FooterItem>
            )}
          </Box>
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapCard;
