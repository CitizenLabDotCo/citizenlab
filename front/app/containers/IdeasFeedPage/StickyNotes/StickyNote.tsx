import React, { useEffect } from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
  Icon,
} from '@citizenlab/cl2-component-library';
import { uniq } from 'lodash-es';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import useAddIdeaExposure from 'api/idea_exposure/useAddIdeaExposure';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import Avatar from 'components/Avatar';
import ReactionControl from 'components/ReactionControl';
import Emoji from 'components/UI/Emoji';

import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { stripHtml } from 'utils/textUtils';

export const NOTE_ASPECT_RATIO = 4 / 5;
export const NOTE_ASPECT_RATIO_COMPACT = 0.95;

export const NOTE_WIDTH = 320;

const StyledNote = styled(Box)<{ noteAspectRatio: number }>`
  padding: 20px;
  border-radius: ${stylingConsts.borderRadius};
  transition: all 0.3s ease;
  text-align: left;
  aspect-ratio: ${({ noteAspectRatio }) => noteAspectRatio};
  overflow: hidden;
  &:hover,
  &:focus {
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const BodyText = styled(Text)`
  overflow: hidden;
  word-break: break-word;
  height: 100%;
`;

const BodyContainer = styled(Box)<{ fadeColor: string }>`
  position: relative;
  min-height: 0;
  overflow: hidden;
  flex: 1;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 36px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${({ fadeColor }) => fadeColor}80 50%,
      ${({ fadeColor }) => fadeColor} 100%
    );
    pointer-events: none;
  }
`;

interface Props {
  ideaId: string;
  rotation?: number;
  topicBackgroundColor: string;
  topicEmojis?: string[];
  onClick?: () => void;
  centeredIdeaId?: string;
  showReactions?: boolean;
}

const StickyNote: React.FC<Props> = ({
  ideaId,
  rotation = 0,
  topicBackgroundColor,
  topicEmojis = [],
  onClick,
  centeredIdeaId,
  showReactions = true,
}) => {
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id') || undefined;
  const { data: phase } = usePhase(phaseId);

  const isCentered = centeredIdeaId === ideaId;
  const noteWidth = NOTE_WIDTH;
  const noteAspectRatio = showReactions
    ? NOTE_ASPECT_RATIO
    : NOTE_ASPECT_RATIO_COMPACT;

  const { data: idea } = useIdeaById(ideaId);
  const localize = useLocalize();
  const { mutate: addIdeaExposure } = useAddIdeaExposure();

  // Track idea exposure when sticky note becomes centered
  useEffect(() => {
    if (isCentered) {
      addIdeaExposure({ ideaId });
    }
  }, [isCentered, ideaId, addIdeaExposure]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  // When an unauthenticated user clicks a reaction, set this idea as the initial
  // idea so it stays centered after the auth flow completes
  const handleUnauthenticatedReactionClick = () => {
    updateSearchParams({ initial_idea_id: ideaId });
  };

  if (!idea) {
    return null;
  }

  const title = localize(idea.data.attributes.title_multiloc);
  const bodyText = stripHtml(localize(idea.data.attributes.body_multiloc));
  const authorName = idea.data.attributes.author_name;
  const authorId = idea.data.relationships.author?.data?.id || null;
  const authorHash = idea.data.attributes.author_hash;
  const commentsCount = idea.data.attributes.comments_count;
  const showCommentIcon =
    phase?.data.attributes.commenting_enabled || commentsCount > 0;

  return (
    <StyledNote
      as="button"
      borderRadius="2px"
      width={`${noteWidth}px`}
      noteAspectRatio={noteAspectRatio}
      transform={`rotate(${rotation}deg)`}
      background={topicBackgroundColor || colors.teal200}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
      cursor="pointer"
      position="relative"
      display="flex"
      flexDirection="column"
      gap="8px"
      border="none"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
    >
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        {authorName && (
          <Box display="flex" alignItems="center">
            <Avatar userId={authorId} authorHash={authorHash} size={24} />
            <Text
              fontSize="s"
              fontWeight="semi-bold"
              color="textPrimary"
              m="0px"
            >
              {authorName}
            </Text>
          </Box>
        )}
        {topicEmojis.length > 0 && (
          <Box
            display="flex"
            flexWrap="wrap"
            gap="4px"
            justifyContent="flex-end"
            ml="auto"
          >
            {uniq(topicEmojis).map((emoji, index) => (
              <Box
                key={index}
                background={colors.white}
                borderRadius={stylingConsts.borderRadius}
                p="8px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Emoji emoji={emoji} size="20px" />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Text fontSize="xxl" fontWeight="bold" m="0px" color={'textPrimary'}>
        {title}
      </Text>

      <BodyContainer
        fadeColor={topicBackgroundColor || colors.teal200}
        pb="8px"
      >
        <BodyText fontSize="m" color="textPrimary" m="0px">
          {bodyText}
        </BodyText>
      </BodyContainer>
      {showReactions && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap="8px"
          flexShrink={0}
        >
          <Box display="flex" alignItems="center" gap="4px">
            {showCommentIcon && (
              <>
                <Icon
                  name="comments"
                  fill={colors.textSecondary}
                  width="20px"
                  height="20px"
                />
                <Text fontSize="m" color="textSecondary" m="0px" ml="4px">
                  {commentsCount}
                </Text>
              </>
            )}
          </Box>
          {phase?.data.attributes.reacting_enabled && (
            <ReactionControl
              ideaId={ideaId}
              size="1"
              styleType="compact"
              unauthenticatedReactionClick={handleUnauthenticatedReactionClick}
            />
          )}
        </Box>
      )}
    </StyledNote>
  );
};

export default StickyNote;
