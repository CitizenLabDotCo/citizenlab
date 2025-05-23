import React from 'react';

import {
  Box,
  Spinner,
  Text,
  Icon,
  colors,
} from '@citizenlab/cl2-component-library';
import { useParams, useSearchParams } from 'react-router-dom';
import { Multiloc } from 'typings';

import { IIdeaData } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import useProjectBySlug from 'api/projects/useProjectBySlug';
import useSimilarIdeas from 'api/similar_ideas/useSimilarIdeas';

import useLocale from 'hooks/useLocale';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const SimilarIdeasList = ({
  titleMultiloc,
  bodyMultiloc,
  selectedIdeaId,
  setSelectedIdeaId,
}: {
  titleMultiloc?: Multiloc;
  bodyMultiloc?: Multiloc;
  selectedIdeaId?: string;
  setSelectedIdeaId: (id?: string) => void;
}) => {
  const { formatMessage } = useIntl();
  const currentLocale = useLocale();
  const { slug: projectSlug } = useParams() as { slug: string };
  const [searchParams] = useSearchParams();
  const { ideaId: idea_id } = useParams<{
    ideaId?: string;
  }>();
  const ideaId = searchParams.get('idea_id') || idea_id;
  const { data: idea } = useIdeaById(ideaId ?? undefined);
  const projectId = idea?.data.relationships.project.data.id;
  const projectById = useProjectById(projectId);
  // If we have the projectId, we can use it to fetch the project directly so we don't need to fetch it by slug
  const projectBySlug = useProjectBySlug(projectId ? undefined : projectSlug);
  const project = projectById.data ?? projectBySlug.data;

  const title = titleMultiloc && titleMultiloc[currentLocale];
  const body = bodyMultiloc && bodyMultiloc[currentLocale];

  const { data: ideas, isLoading } = useSimilarIdeas(
    {
      idea: {
        project_id: project?.data.id,
        ...((title || '').trim() && {
          title_multiloc: { [currentLocale]: title },
        }),
        ...((body || '').trim() && {
          body_multiloc: { [currentLocale]: body },
        }),
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
          background={
            selectedIdeaId === idea.id ? colors.background : undefined
          }
        >
          <Box
            onClick={() => {
              // If the selected idea is already selected, we deselect it
              setSelectedIdeaId(
                selectedIdeaId === idea.id ? undefined : idea.id
              );
            }}
            style={{ cursor: 'pointer' }}
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
                <T value={idea.attributes.title_multiloc} />
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
      ))}
    </Box>
  );
};

export default SimilarIdeasList;
