import React, { useEffect } from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
  Icon,
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

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const nextSpace = text.indexOf(' ', maxLength);
  const cutoff = nextSpace === -1 ? text.length : nextSpace;
  return `${text.slice(0, cutoff)}...`;
};

export const NOTE_HEIGHTS = {
  small: 350,
  large: 500,
};

const StyledNote = styled(Box)`
  padding: 20px;
  width: 90%;
  border-radius: ${stylingConsts.borderRadius};
  transition: all 0.3s ease;
  text-align: left;
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

interface Props {
  ideaId: string;
  rotation?: number;
  topicBackgroundColor: string;
  topicEmojis?: string[];
  onClick?: () => void;
  centeredIdeaId?: string;
  size?: 'small' | 'large';
  showReactions?: boolean;
}

const StickyNote: React.FC<Props> = ({
  ideaId,
  rotation = 0,
  topicBackgroundColor,
  topicEmojis = [],
  onClick,
  centeredIdeaId,
  size = 'large',
  showReactions = true,
}) => {
  const [searchParams] = useSearchParams();
  const phaseId = searchParams.get('phase_id') || undefined;
  const { data: phase } = usePhase(phaseId);

  const isCentered = centeredIdeaId === ideaId;
  const noteHeight = NOTE_HEIGHTS[size];

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
      minWidth="300px"
      maxWidth="350px"
      height={`${noteHeight}px`}
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
            {topicEmojis.map((emoji, index) => (
              <Box
                key={index}
                background={colors.white}
                borderRadius="50%"
                p="8px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Emoji emoji={emoji} size="28px" />
              </Box>
            ))}
          </Box>
        )}
      </Box>
      <Text fontSize="l" fontWeight="bold" m="0px" color={'textPrimary'}>
        {truncateText(title, size === 'small' ? 45 : 100)}
      </Text>

      <Box flex="1" minHeight="0" overflow="hidden">
        <BodyText fontSize="m" color="textPrimary" m="0px">
          {truncateText(bodyText, size === 'small' ? 230 : 400)}
        </BodyText>
      </Box>
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
