import React, { memo } from 'react';

import {
  Icon,
  Box,
  defaultCardStyle,
  fontSizes,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IIdeaMarkerData } from 'api/idea_markers/types';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import T from 'components/T';
import CloseIconButton from 'components/UI/CloseIconButton';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getVotingMethodConfig } from 'utils/configs/votingMethodConfig';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

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
  idea: IIdeaMarkerData;
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
    const isMobileOrSmaller = useBreakpoint('phone');
    const phaseData = phase?.data;

    const votingMethodConfig = getVotingMethodConfig(
      phaseData?.attributes.voting_method
    );
    const isVotingPhase = !!votingMethodConfig;
    const isParticipatoryBudgetPhase =
      phaseData?.attributes.voting_method === 'budgeting';

    const handleOnClick = (event: React.FormEvent) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      event?.preventDefault();
      updateSearchParams({ idea_map_id: idea.id });
      onSelectIdea(idea.id);
      const mapElement = document.getElementById('e2e-ideas-map');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    const handleOnKeyPress = (event: React.KeyboardEvent) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const ideaBudget = idea.attributes?.budget;
      const reactingActionDescriptor =
        project.data.attributes.action_descriptors.reacting_idea;

      const showDislike =
        reactingActionDescriptor.down.enabled === true || // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (reactingActionDescriptor.down.enabled === false &&
          reactingActionDescriptor.down.disabled_reason !==
            'reacting_dislike_disabled');

      const commentingEnabled =
        project.data.attributes.action_descriptors.commenting_idea.enabled;
      const ideaHasComments = idea.attributes.comments_count > 0;
      const showCommentCount = commentingEnabled || ideaHasComments;
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
          tabIndex={0}
          id="e2e-idea-map-card"
        >
          {isMobileOrSmaller && onClose && (
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
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
                    {/* Hidden to use easier-to-understand text for screen readers */}
                    <FooterValue id="e2e-map-card-like-count" aria-hidden>
                      {idea.attributes.likes_count}
                    </FooterValue>
                    <ScreenReaderOnly>
                      <FormattedMessage
                        {...messages.screenReaderLikesText}
                        values={{ noOfLikes: idea.attributes.likes_count }}
                      />
                    </ScreenReaderOnly>
                  </FooterItem>

                  {showDislike && (
                    <FooterItem>
                      <DislikeIcon name="vote-down" />
                      {/* Hidden to use easier to understand text for screen readers */}
                      <FooterValue id="e2e-map-card-dislike-count" aria-hidden>
                        {idea.attributes.dislikes_count}
                      </FooterValue>
                      <ScreenReaderOnly>
                        <FormattedMessage
                          {...messages.screenReaderDislikesText}
                          values={{
                            noOfDislikes: idea.attributes.dislikes_count,
                          }}
                        />
                      </ScreenReaderOnly>
                    </FooterItem>
                  )}
                </>
              )}
            {showCommentCount && (
              <FooterItem>
                <CommentIcon name="comments" />
                {/* Hidden to use easier to understand text for screen readers */}
                <FooterValue aria-hidden>
                  {idea.attributes.comments_count}
                </FooterValue>
                <ScreenReaderOnly>
                  <FormattedMessage
                    {...messages.screenReaderCommentsText}
                    values={{ noOfComments: idea.attributes.comments_count }}
                  />
                </ScreenReaderOnly>
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
