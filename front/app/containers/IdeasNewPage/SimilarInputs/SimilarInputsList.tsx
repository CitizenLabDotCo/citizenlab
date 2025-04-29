import React, { ReactElement } from 'react';

import {
  Box,
  Spinner,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';

import { IIdeaData } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useSimilarIdeas from 'api/similar_ideas/useSimilarIdeas';

import useLocale from 'hooks/useLocale';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import { useIdeaSelect } from './InputSelectContext';
import messages from './messages';

const SimilarIdeasList = () => {
  const { onIdeaSelect, title, body, selectedIdeaId } = useIdeaSelect();
  const { formatMessage } = useIntl();
  const currentLocale = useLocale();
  // Extract project slug and optional ideaId from URL params
  const { slug: projectSlug, ideaId: idea_id } = useParams<{
    slug: string;
    ideaId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const ideaId = searchParams.get('idea_id') || idea_id;
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const projectId = idea?.data.relationships.project.data.id;
  const projectById = useProjectById(projectId);
  // If we have the projectId, we can use it to fetch the project directly so we don't need to fetch it by slug
  const projectBySlug = useProjectBySlug(projectId ? undefined : projectSlug);
  const project = projectById.data ?? projectBySlug.data;

  const { data: ideas, isLoading } = useSimilarIdeas(
    {
      idea: {
        project_id: project?.data.id,
        ...(title.trim() && {
          title_multiloc: { [currentLocale]: title },
        }),
        ...(body.trim() && {
          body_multiloc: { [currentLocale]: body },
        }),
      },
    },
    { enabled: !!project?.data.id }
  );

  if (isLoading) {
    return (
      <>
        <ScreenReaderOnly aria-live="polite" role="status">
          {formatMessage(messages.similarSubmissionsSearch)}
        </ScreenReaderOnly>
        <Box display="flex" mt="16px" alignItems="center">
          <Box w="20px" mr="4px">
            <Spinner size="18px" />
          </Box>
          <Text my="0px" color="grey700" variant="bodyM">
            {formatMessage(messages.similarSubmissionsSearch)}
          </Text>
        </Box>
      </>
    );
  }
  const isTitleShort = !title || title.length < 3;
  const isDescriptionShort = !body || body.length < 3;

  if (!ideas || (isTitleShort && isDescriptionShort)) return null;

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
      <Text
        id="similar-ideas-heading"
        fontSize="s"
        fontWeight="bold"
        color="textPrimary"
        mb="4px"
      >
        {formatMessage(messages.similarSubmissionsPosted)}
      </Text>
      <Text fontSize="s" color="textSecondary" mb="16px">
        {formatMessage(messages.similarSubmissionsDescription)}
      </Text>
      <ScreenReaderOnly aria-live="polite" role="status">
        {formatMessage(messages.similarSubmissionsAnnounceResults, {
          count: ideas.data.length,
        })}
      </ScreenReaderOnly>
      <Box role="list" aria-labelledby="similar-ideas-heading">
        {ideas.data.map((idea: IIdeaData, index: number, listedIdeas) => {
          const isSelected = selectedIdeaId === idea.id;
          const handleSelect = () => onIdeaSelect(isSelected ? null : idea.id);
          return (
            <Box
              role="listitem"
              key={idea.id}
              borderTop={`1px solid ${colors.grey300}`}
              borderBottom={
                listedIdeas.length - 1 === index
                  ? `1px solid ${colors.grey300}`
                  : undefined
              }
              py="12px"
              background={isSelected ? colors.background : undefined}
            >
              <Box
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={handleSelect}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect();
                  }
                }}
                style={{ cursor: 'pointer' }}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  width="100%"
                  mr="24px"
                >
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SimilarIdeasList;
