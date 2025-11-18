import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useIdeaById from 'api/ideas/useIdeaById';

import useLocalize from 'hooks/useLocalize';

const StyledStickyNote = styled(Box)`
  background: ${colors.teal200};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-4px) rotate(0deg);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const IdeaTitle = styled(Text)`
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: 8px;
  word-wrap: break-word;
`;

const IdeaBody = styled(Text)`
  font-size: 16px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const AuthorName = styled(Text)`
  font-size: 14px;
  font-style: italic;
  margin-top: 8px;
`;

interface Props {
  ideaId: string;
  rotation?: number;
}

const StickyNote: React.FC<Props> = ({ ideaId, rotation = 0 }) => {
  const { data: idea } = useIdeaById(ideaId);
  const localize = useLocalize();

  if (!idea) {
    return null;
  }

  const title = localize(idea.data.attributes.title_multiloc);
  const body = localize(idea.data.attributes.body_multiloc);
  const authorName = idea.data.attributes.author_name;

  return (
    <StyledStickyNote
      p="20px"
      borderRadius="2px"
      w="250px"
      minHeight="200px"
      transform={`rotate(${rotation}deg)`}
    >
      {title && <IdeaTitle>{title}</IdeaTitle>}
      {body && <IdeaBody>{body}</IdeaBody>}
      {authorName && <AuthorName>— {authorName}</AuthorName>}
    </StyledStickyNote>
  );
};

export default StickyNote;
