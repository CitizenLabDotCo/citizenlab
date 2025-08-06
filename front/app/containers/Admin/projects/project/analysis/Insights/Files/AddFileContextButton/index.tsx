import React from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import useAnalysis from 'api/analyses/useAnalysis';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
  analysisId: string;
};
const AddFileContext = ({ setIsFileSelectionOpen, analysisId }: Props) => {
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
        fontSize="s"
        onClick={() => setIsFileSelectionOpen(true)}
      />
    </Box>
  );
};

export default AddFileContext;
