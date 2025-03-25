// IdeaDetailView.tsx
import React from 'react';

import {
  Box,
  Text,
  Icon,
  Spinner,
  colors,
  Button,
} from '@citizenlab/cl2-component-library';

import useIdeaById from 'api/ideas/useIdeaById';

import QuillEditedContent from 'components/UI/QuillEditedContent';

interface IdeaDetailViewProps {
  ideaId: string;
  onClose?: () => void;
}

const IdeaDetailView = ({ ideaId, onClose }: IdeaDetailViewProps) => {
  const { data: idea, isLoading } = useIdeaById(ideaId);

  if (isLoading) return <Spinner />;

  if (!idea) {
    return <Text variant="bodyM">Idea not found.</Text>;
  }

  const {
    title_multiloc,
    author_name,
    body_multiloc,
    likes_count,
    dislikes_count,
    comments_count,
  } = idea.data.attributes;

  return (
    <Box p="24px">
      <Box display="flex" justifyContent="flex-end" mb="16px">
        <Button
          icon="close"
          onClick={onClose}
          buttonStyle="text"
          padding="0px"
          minWidth="0px"
          minHeight="0px"
        />
      </Box>

      <Text variant="bodyS" fontWeight="bold" color="textPrimary" mb="12px">
        {title_multiloc.en}
      </Text>

      {/* Author + stats */}
      <Box display="flex" alignItems="center" gap="8px" mb="16px">
        <Icon
          name="user-circle"
          width="16px"
          height="16px"
          fill={colors.grey700}
        />
        <Text variant="bodyS" color="grey700">
          {author_name}
        </Text>
        <Box flex="1" />
        <Box display="flex" gap="16px">
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="thumb-up"
              width="16px"
              height="16px"
              fill={colors.grey700}
            />
            <Text variant="bodyS">{likes_count}</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="thumb-down"
              width="16px"
              height="16px"
              fill={colors.grey700}
            />
            <Text variant="bodyS">{dislikes_count}</Text>
          </Box>
          <Box display="flex" alignItems="center" gap="4px">
            <Icon
              name="chat-bubble"
              width="16px"
              height="16px"
              fill={colors.grey700}
            />
            <Text variant="bodyS">{comments_count}</Text>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <QuillEditedContent>
        <div
          dangerouslySetInnerHTML={{
            __html: body_multiloc.en || '',
          }}
        />
      </QuillEditedContent>
    </Box>
  );
};

export default IdeaDetailView;
