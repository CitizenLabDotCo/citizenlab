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
  const { slug } = useParams() as {
    slug: string;
  };
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

  if (!query || query.length < 3) return null;
  if (isLoading) return <Spinner />;

  if (!ideas) return null;

  return (
    <Box borderTop={`1px solid ${colors.grey300}`}>
      <Text fontSize="s" fontWeight="bold" color="textPrimary" mb="4px">
        {formatMessage(messages.similarSubmissionsPosted)}
      </Text>
      <Text fontSize="s" color="textSecondary">
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
              <Box>
                <Text
                  fontSize="s"
                  fontWeight="bold"
                  color="textPrimary"
                  mb="4px"
                >
                  {idea.attributes.title_multiloc.en}
                </Text>
                <Box display="flex" alignItems="center" gap="4px">
                  <Icon
                    name="user"
                    width="12px"
                    height="12px"
                    fill={colors.textPrimary}
                    transform="scaleX(-1)"
                  />
                  <Text fontSize="xs" color="textPrimary">
                    {idea.attributes.author_name}
                  </Text>
                </Box>
              </Box>
              <Icon
                name="chevron-right"
                width="16px"
                height="16px"
                fill={colors.textSecondary}
              />
            </Box>
          </a>
        </Box>
      ))}
    </Box>
  );
};

export default SimilarIdeasList;
