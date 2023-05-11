import React, { memo, useEffect, useState } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';
import { isNilOrError } from 'utils/helperUtils';

// components
import CloseIconButton from 'components/UI/CloseIconButton';
import { Icon, useWindowSize } from '@citizenlab/cl2-component-library';

// events
import eventEmitter from 'utils/eventEmitter';
import { setIdeaMapCardSelected } from './events';
import {
  setLeafletMapHoveredMarker,
  leafletMapHoveredMarker$,
} from 'components/UI/LeafletMap/events';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectById from 'api/projects/useProjectById';
import usePhase from 'hooks/usePhase';

// i18n
import T from 'components/T';
import FormattedBudget from 'utils/currency/FormattedBudget';
import messages from './messages';

// styling
import styled from 'styled-components';
import {
  defaultCardStyle,
  fontSizes,
  colors,
  viewportWidths,
  media,
} from 'utils/styleUtils';

import { darken } from 'polished';

// typings
import { IIdeaMarkerData } from 'api/idea_markers/types';

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

const Title = styled.h3`
  height: 46px;
  max-height: 46px;
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

  /* ${media.tablet`
    width: calc(100% - 22px);
    margin-bottom: 25px;
  `} */
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
`;

const FooterItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 25px;
`;

const MoneybagIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
`;

const DownvoteIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
`;

const UpvoteIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  margin-top: 5px;
`;

const CommentIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  margin-left: 2px;
`;

const FooterValue = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s + 1}px;
  line-height: normal;
  font-weight: 400;
`;

interface Props {
  ideaMarker: IIdeaMarkerData;
  onClose?: () => void;
  className?: string;
  projectId: string;
  phaseId?: string;
}

const IdeaMapCard = memo<Props>(
  ({ ideaMarker, onClose, className, projectId, phaseId }) => {
    const { data: appConfig } = useAppConfiguration();
    const phase = usePhase(phaseId || null);
    const { data: project } = useProjectById(projectId);
    const { windowWidth } = useWindowSize();
    const tablet = windowWidth <= viewportWidths.tablet;

    const [hovered, setHovered] = useState(false);

    const isParticipatoryBudgetProject =
      project?.data.attributes.process_type === 'continuous' &&
      project?.data.attributes.participation_method === 'budgeting';

    const isParticipatoryBudgetPhase =
      !isNilOrError(phase) &&
      phase.attributes.participation_method === 'budgeting';
    const isParticipatoryBudgetIdea = isNilOrError(phase)
      ? isParticipatoryBudgetProject
      : isParticipatoryBudgetPhase;

    useEffect(() => {
      const subscriptions = [
        leafletMapHoveredMarker$.subscribe((hoverredIdeaId) => {
          if (!tablet) {
            setHovered(hoverredIdeaId === ideaMarker.id);
          }
        }),
      ];

      return () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tablet]);

    const handleOnClick = (event: React.FormEvent) => {
      event?.preventDefault();

      setIdeaMapCardSelected(ideaMarker.id);

      if (tablet) {
        eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
          id: ideaMarker.id,
          slug: ideaMarker.attributes.slug,
          type: 'idea',
        });
      }
    };

    const handleOnKeyPress = (event: React.KeyboardEvent) => {
      if (event?.['key'] === 'Enter') {
        handleOnClick(event);
      }
    };

    const handleOnMouseEnter = () => {
      setLeafletMapHoveredMarker(ideaMarker.id);
    };

    const handleOnMouseLeave = () => {
      setLeafletMapHoveredMarker(null);
    };

    const handleCloseButtonClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      onClose?.();
    };

    if (!isNilOrError(appConfig) && !isNilOrError(ideaMarker) && project) {
      const tenantCurrency = appConfig.data.attributes.settings.core.currency;
      const ideaBudget = ideaMarker.attributes?.budget;
      const votingActionDescriptor =
        project.data.attributes.action_descriptor.voting_idea;
      const showDownvote =
        votingActionDescriptor.down.enabled === true ||
        (votingActionDescriptor.down.enabled === false &&
          votingActionDescriptor.down.disabled_reason !==
            'downvoting_disabled');
      const commentingEnabled =
        project.data.attributes.action_descriptor.commenting_idea.enabled;

      const projectHasComments = project.data.attributes.comments_count > 0;
      const showCommentCount = commentingEnabled || projectHasComments;

      return (
        <Container
          className={`${className || ''} ${hovered ? 'hover' : ''}`}
          onClick={handleOnClick}
          onKeyPress={handleOnKeyPress}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
          role="button"
          tabIndex={0}
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
          <Title>
            <T value={ideaMarker.attributes.title_multiloc} />
          </Title>
          <Footer>
            {isParticipatoryBudgetIdea && tenantCurrency && ideaBudget && (
              <FooterItem>
                <MoneybagIcon name="coin-stack" />
                <FooterValue>
                  <FormattedBudget value={ideaBudget} />
                </FooterValue>
              </FooterItem>
            )}
            {!isParticipatoryBudgetIdea && (
              <>
                <FooterItem>
                  <DownvoteIcon name="vote-up" />
                  <FooterValue>
                    {ideaMarker.attributes.upvotes_count}
                  </FooterValue>
                </FooterItem>
                {showDownvote && (
                  <FooterItem>
                    <UpvoteIcon name="vote-down" />
                    <FooterValue>
                      {ideaMarker.attributes.downvotes_count}
                    </FooterValue>
                  </FooterItem>
                )}
              </>
            )}
            {showCommentCount && (
              <FooterItem>
                <CommentIcon name="comments" />
                <FooterValue>
                  {ideaMarker.attributes.comments_count}
                </FooterValue>
              </FooterItem>
            )}
          </Footer>
        </Container>
      );
    }

    return null;
  }
);

export default IdeaMapCard;
