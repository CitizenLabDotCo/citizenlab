import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FilesUpload from '../FilesUpload';

import FeatureDescription from './components/FeatureDescription';

type Props = {
  setShowFirstUploadView?: (value: boolean) => void;
};
const FirstUploadView = ({ setShowFirstUploadView }: Props) => {
  const isDataRepositoryAIAnalysisEnabled = useFeatureFlag({
    name: 'data_repository_ai_analysis',
  }); // TODO: Re-enable once sense-making feature is ready. Remove this FF check.

  return (
    <Box display="flex" justifyContent="center" mt="40px">
      <Box
        p="32px"
        display="flex"
        justifyContent="center"
        bgColor={colors.white}
        gap="32px"
      >
        <Box>
          <FilesUpload setShowFirstUploadView={setShowFirstUploadView} />
        </Box>
        {isDataRepositoryAIAnalysisEnabled && ( // TODO: Re-enable once sense-making feature is ready. Remove this conditional.
          <Box width="400px">
            <FeatureDescription />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default FirstUploadView;
