import React from 'react';

import { Box, Title, Text, Spinner } from '@citizenlab/cl2-component-library';

import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

import useLocalize from 'hooks/useLocalize';

import IdeaCard from 'components/IdeaCard';

import { useIntl } from 'utils/cl-intl';

import ExportableInsight from '../../word/ExportableInsight';
import wordMessages from '../../word/messages';
import { useWordSection } from '../../word/useWordSection';
import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

const NUMBER_OF_IDEAS = 5;

const MostLikedIdeas = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: ideasData, isLoading } = useInfiniteIdeas({
    phase: phaseId,
    sort: 'popular',
    'page[size]': NUMBER_OF_IDEAS,
  });

  const ideas = ideasData?.pages[0]?.data ?? [];

  // Native Word table: idea title + vote count (editable, no screenshot)
  useWordSection(
    'most-liked-ideas',
    () => {
      if (ideas.length === 0) return [];

      const rows: string[][] = [
        [formatMessage(messages.mostLiked), formatMessage(wordMessages.likes)],
        ...ideas.map((idea) => [
          localize(idea.attributes.title_multiloc),
          String(idea.attributes.likes_count),
        ]),
      ];

      return [
        { type: 'heading', text: formatMessage(messages.mostLiked), level: 2 },
        { type: 'table', rows, columnWidths: [80, 20] },
      ];
    },
    { skip: isLoading || ideas.length === 0 }
  );

  if (isLoading) {
    return (
      <ExportableInsight exportId="most-liked-ideas" skipExport>
        <Box mt="24px" p="24px" bg="white" borderRadius="3px">
          <Box display="flex" alignItems="center" gap="8px">
            <Spinner size="24px" />
            <Text m="0">{formatMessage(messages.loading)}</Text>
          </Box>
        </Box>
      </ExportableInsight>
    );
  }

  if (ideas.length === 0) {
    return (
      <ExportableInsight exportId="most-liked-ideas" skipExport>
        <Box />
      </ExportableInsight>
    );
  }

  return (
    <ExportableInsight exportId="most-liked-ideas">
      <Box mt="24px" p="8px" background="rgba(4, 77, 108, 0.05)">
        <Title variant="h3" m="0" mb="8px">
          {formatMessage(messages.mostLiked)}
        </Title>
        <Text m="0" mb="16px" color="textSecondary">
          {formatMessage(messages.mostLikedDescription)}
        </Text>
        <Box
          bg="white"
          borderRadius="3px"
          display="flex"
          flexDirection="column"
          gap="16px"
        >
          {ideas.map((idea, index) => (
            <Box
              key={idea.id}
              data-export-id={`most-liked-idea-${index}`}
              pb="16px"
            >
              <IdeaCard ideaId={idea.id} phaseId={phaseId} />
            </Box>
          ))}
        </Box>
      </Box>
    </ExportableInsight>
  );
};

export default MostLikedIdeas;
