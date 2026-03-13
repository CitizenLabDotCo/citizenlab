import React from 'react';

import { Box, Title, Text, Spinner } from '@citizenlab/cl2-component-library';

import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

import useLocalize from 'hooks/useLocalize';

import IdeaCard from 'components/IdeaCard';

import { useIntl } from 'utils/cl-intl';

import wordMessages from '../../word/messages';
import { useWordSection } from '../../word/useWordSection';
import WordExportableInsight from '../../word/WordExportableInsight';
import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

const NUMBER_OF_PROPOSALS = 5;

const MostLikedProposals = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data: proposalsData, isLoading } = useInfiniteIdeas({
    phase: phaseId,
    sort: 'popular',
    'page[size]': NUMBER_OF_PROPOSALS,
  });

  const proposals = proposalsData?.pages[0]?.data ?? [];

  // Native Word table: proposal title + vote count
  useWordSection(
    'most-liked-proposals',
    () => {
      if (proposals.length === 0) return [];

      const rows: string[][] = [
        [formatMessage(messages.mostLiked), formatMessage(wordMessages.likes)],
        ...proposals.map((proposal) => [
          localize(proposal.attributes.title_multiloc),
          String(proposal.attributes.likes_count),
        ]),
      ];

      return [
        { type: 'heading', text: formatMessage(messages.mostLiked), level: 2 },
        { type: 'table', rows, columnWidths: [80, 20] },
      ];
    },
    { skip: isLoading || proposals.length === 0 }
  );

  if (isLoading) {
    return (
      <WordExportableInsight exportId="most-liked-proposals" skipExport>
        <Box
          p="24px"
          bg="white"
          borderRadius="3px"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="24px" />
        </Box>
      </WordExportableInsight>
    );
  }

  if (proposals.length === 0) {
    return (
      <WordExportableInsight exportId="most-liked-proposals" skipExport>
        <Box />
      </WordExportableInsight>
    );
  }

  return (
    <WordExportableInsight exportId="most-liked-proposals" skipExport>
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
          {proposals.map((proposal) => (
            <Box key={proposal.id} pb="16px">
              <IdeaCard ideaId={proposal.id} phaseId={phaseId} />
            </Box>
          ))}
        </Box>
      </Box>
    </WordExportableInsight>
  );
};

export default MostLikedProposals;
