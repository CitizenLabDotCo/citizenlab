import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';

import useFeatureFlag from 'hooks/useFeatureFlag';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
  analysisId: string; // Optional, if needed for context
};
const AddFileContext = ({ setIsFileSelectionOpen, analysisId }: Props) => {
  const { data: analysis } = useAnalysis(analysisId);

  const isDataRepositoryEnabled = useFeatureFlag({
    name: 'data_repository',
  });

  const isDataRepositoryAiAnalysisEnabled = useFeatureFlag({
    name: 'data_repository_ai_analysis',
  });

  const numberAttachedFiles =
    analysis?.data.relationships.files?.data.length || 0;

  const { formatMessage } = useIntl();

  if (!isDataRepositoryEnabled) {
    return null;
  }

  return (
    <UpsellTooltip disabled={isDataRepositoryAiAnalysisEnabled}>
      <Box display="flex" alignItems="center">
        <Button
          icon="plus-circle"
          text={formatMessage(messages.attachFilesWithCurrentCount, {
            numberAttachedFiles,
          })}
          buttonStyle="text"
          iconSize="20px"
          fontSize="s"
          onClick={() => setIsFileSelectionOpen(true)}
          disabled={!isDataRepositoryAiAnalysisEnabled}
        />
      </Box>
    </UpsellTooltip>
  );
};

export default AddFileContext;
