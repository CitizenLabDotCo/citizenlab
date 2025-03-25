import React from 'react';

import {
  Box,
  Spinner,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import { IIdeaData } from 'api/ideas/types';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useSimilarIdeas from 'api/similar_ideas/useSimilarIdeas';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  query: string;
}

const SimilarIdeasList = ({ query }: Props) => {
  const { formatMessage } = useIntl();
  const { slug } = useParams() as { slug: string };
  const { data: project } = useProjectBySlug(slug);
  const { data: ideas, isLoading } = useSimilarIdeas(
    {
      idea: {
        title_multiloc: { en: query },
        project_id: project?.data.id,
      },
    },
    { enabled: !!project?.data.id }
  );

  if (isLoading) {
    return (
      <Box display="flex" mt="16px" alignItems="center">
        <Box w="20px" mr="4px">
          <Spinner size="18px" />
        </Box>
        <Text my="0px" color="grey700" variant="bodyM">
          {formatMessage(messages.similarSubmissionsSearch)}
        </Text>
      </Box>
    );
  }

  if (!ideas || !query || query.length < 3) return null;

  if (ideas.data.length === 0) {
    return (
      <Box display="flex" mt="16px" alignItems="center" gap="4px">
        <Icon
          name="check-circle"
          width="18px"
          height="18px"
          fill={colors.green400}
        />
        <Text my="0px" color="grey700" variant="bodyM">
          {formatMessage(messages.noSimilarSubmissions)}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text fontSize="s" fontWeight="bold" color="textPrimary" mb="4px">
        {formatMessage(messages.similarSubmissionsPosted)}
      </Text>
      <Text fontSize="s" color="textSecondary" mb="16px">
        {formatMessage(messages.similarSubmissionsDescription)}
      </Text>

      {ideas.data.map((idea: IIdeaData, index: number, listedIdeas) => (
        <Box
          key={idea.id}
          borderTop={`1px solid ${colors.grey300}`}
          borderBottom={
            listedIdeas.length - 1 === index
              ? `1px solid ${colors.grey300}`
              : undefined
          }
          py="12px"
        >
          <a
            href={`/ideas/${idea.attributes.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box display="flex" flexDirection="column" width="100%" mr="24px">
                <Text
                  variant="bodyM"
                  fontWeight="bold"
                  color="textPrimary"
                  my="0px"
                >
                  {idea.attributes.title_multiloc.en}
                </Text>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap="4px">
                    <Icon
                      name="user-circle"
                      width="16px"
                      height="16px"
                      fill={colors.textPrimary}
                    />
                    <Text variant="bodyS" color="grey700" m="0px">
                      {idea.attributes.author_name}
                    </Text>
                  </Box>

                  <Box display="flex" alignItems="center" gap="16px">
                    <Box display="flex" alignItems="center" gap="4px">
                      <Icon
                        name="thumb-up"
                        width="14px"
                        height="14px"
                        fill={colors.grey700}
                      />
                      <Text fontSize="xs" color="grey700" m="0">
                        {idea.attributes.likes_count}
                      </Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="4px">
                      <Icon
                        name="thumb-down"
                        width="14px"
                        height="14px"
                        fill={colors.grey700}
                      />
                      <Text fontSize="xs" color="grey700" m="0">
                        {idea.attributes.dislikes_count}
                      </Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="4px">
                      <Icon
                        name="chat-bubble"
                        width="14px"
                        height="14px"
                        fill={colors.grey700}
                      />
                      <Text fontSize="xs" color="grey700" m="0">
                        {idea.attributes.comments_count}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Icon
                name="chevron-right"
                width="20px"
                height="20px"
                fill={colors.textPrimary}
              />
            </Box>
          </a>
        </Box>
      ))}
    </Box>
  );
};

export default SimilarIdeasList;
