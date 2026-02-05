import React, { useEffect } from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
  Icon,
  Tooltip,
} from '@citizenlab/cl2-component-library';
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
    height: 60px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      ${({ fadeColor }) => fadeColor}20 25%,
      ${({ fadeColor }) => fadeColor}60 50%,
      ${({ fadeColor }) => fadeColor}cc 75%,
      ${({ fadeColor }) => fadeColor} 100%
    );
    pointer-events: none;
  }
`;

export interface TopicInfo {
  emoji: string;
  name: string;
}

interface Props {
  ideaId: string;
  rotation?: number;
  topicBackgroundColor: string;
  topics?: TopicInfo[];
  onClick?: () => void;
  centeredIdeaId?: string;
  showReactions?: boolean;
}

const MAX_VISIBLE_TOPICS = 2;

const StickyNote: React.FC<Props> = ({
  ideaId,
  rotation = 0,
  topicBackgroundColor,
  topics = [],
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
      border="none"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        gap="8px"
        mb="24px"
      >
        {authorName && (
          <Box display="flex" alignItems="center" minWidth="0" flex="1 1 auto">
            <Avatar userId={authorId} authorHash={authorHash} size={24} />
            <Text
              fontSize="s"
              fontWeight="semi-bold"
              color="textPrimary"
              m="0px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {authorName}
            </Text>
          </Box>
        )}
        {topics.length > 0 && (
          <Tooltip
            placement="top"
            content={
              <Box as="ul" m="0px" p="4px">
                {topics.map((topic, index) => (
                  <Box
                    key={index}
                    as="li"
                    display="flex"
                    alignItems="center"
                    gap="8px"
                    py="2px"
                  >
                    <Emoji emoji={topic.emoji} size="16px" />
                    <Text fontSize="s" color="white" m="0px">
                      {topic.name}
                    </Text>
                  </Box>
                ))}
              </Box>
            }
            theme="dark"
          >
            <Box
              display="flex"
              alignItems="center"
              gap="4px"
              flexShrink={0}
              onClick={(e) => e.stopPropagation()}
            >
              {topics.slice(0, MAX_VISIBLE_TOPICS).map((topic, index) => (
                <Box
                  key={index}
                  background={colors.white}
                  borderRadius={stylingConsts.borderRadius}
                  width="24px"
                  height="24px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Emoji emoji={topic.emoji} size="16px" />
                </Box>
              ))}
              {topics.length > MAX_VISIBLE_TOPICS && (
                <Text
                  fontSize="s"
                  fontWeight="semi-bold"
                  color="textPrimary"
                  m="0px"
                >
                  +{topics.length - MAX_VISIBLE_TOPICS}
                </Text>
              )}
            </Box>
          </Tooltip>
        )}
      </Box>
      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        justifyContent="flex-end"
        minHeight="0"
      >
        <Text
          fontSize="xl"
          fontWeight="bold"
          m="0px"
          mb="8px"
          color={'textPrimary'}
        >
          {title}
        </Text>

        <BodyContainer fadeColor={topicBackgroundColor || colors.teal200}>
          <BodyText fontSize="s" color="textPrimary" m="0px">
            {bodyText}
          </BodyText>
        </BodyContainer>
      </Box>
      {showReactions && (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap="8px"
          flexShrink={0}
          mt="8px"
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
