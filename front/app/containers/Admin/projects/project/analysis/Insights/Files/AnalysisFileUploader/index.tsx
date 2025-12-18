import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';

import NewLabel from 'components/UI/NewLabel';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
  analysisId: string;
};
const AnalysisFileUploader = ({
  setIsFileSelectionOpen,
  analysisId,
}: Props) => {
  const { data: analysis } = useAnalysis(analysisId);

  const numberAttachedFiles =
    analysis?.data.relationships.files?.data.length || 0;

  const { formatMessage } = useIntl();
  return (
    <Box display="flex" alignItems="center">
      <Button
        icon="plus-circle"
        text={formatMessage(messages.attachFilesWithCurrentCount, {
          numberAttachedFiles,
        })}
        buttonStyle="text"
        iconSize="20px"
        pr="0px"
        fontSize="s"
        onClick={() => setIsFileSelectionOpen(true)}
      />
      <NewLabel ml="4px" expiryDate={new Date('2026-01-15')} />
    </Box>
  );
};

export default AnalysisFileUploader;
