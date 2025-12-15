import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';

import useLocalize from 'hooks/useLocalize';

import Avatar from 'components/Avatar';
import T from 'components/T';

// Only using styled-component for :hover/:focus pseudo-selectors which aren't available as Box props
const HoverableDiv = styled(Box)`
  transition: all 0.3s ease;
  &:hover,
  &:focus {
    transform: translateY(-4px) rotate(0deg) !important;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1) !important;
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;

interface Props {
  ideaId: string;
  rotation?: number;
  topicBackgroundColor: string;
  onClick?: () => void;
}

const StickyNote: React.FC<Props> = ({
  ideaId,
  rotation = 0,
  topicBackgroundColor,
  onClick,
}) => {
  const { data: idea } = useIdeaById(ideaId);
  const localize = useLocalize();

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  if (!idea) {
    return null;
  }

  const title = localize(idea.data.attributes.title_multiloc);
  const authorName = idea.data.attributes.author_name;
  const authorId = idea.data.relationships.author?.data?.id || null;
  const authorHash = idea.data.attributes.author_hash;

  return (
    <HoverableDiv
      as="button"
      p="12px"
      borderRadius="2px"
      w="250px"
      minHeight="200px"
      transform={`rotate(${rotation}deg)`}
      background={topicBackgroundColor || colors.teal200}
      boxShadow="0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
      cursor="pointer"
      position="relative"
      display="flex"
      flexDirection="column"
      gap="8px"
      border="none"
      textAlign="left"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={title}
    >
      <Text fontSize="l" fontWeight="bold" m="0px" color={'textPrimary'}>
        {title}
      </Text>
      {authorName && (
        <Box display="flex" alignItems="center">
          <Avatar userId={authorId} authorHash={authorHash} size={24} />
          <Text fontSize="s" fontWeight="semi-bold" color="textPrimary" m="0px">
            {authorName}
          </Text>
        </Box>
      )}
      <Text
        fontSize="m"
        color="textPrimary"
        textOverflow="ellipsis"
        overflow="hidden"
        m="0px"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
        }}
      >
        <T supportHtml={true} value={idea.data.attributes.body_multiloc} />
      </Text>
    </HoverableDiv>
  );
};

export default StickyNote;
