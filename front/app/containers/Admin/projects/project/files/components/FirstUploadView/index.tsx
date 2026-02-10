import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import FilesUpload from '../FilesUpload';

import FeatureDescription from './components/FeatureDescription';

type Props = {
  setShowFirstUploadView?: (value: boolean) => void;
};
const FirstUploadView = ({ setShowFirstUploadView }: Props) => {
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
        <Box width="400px">
          <FeatureDescription />
        </Box>
      </Box>
    </Box>
  );
};

export default FirstUploadView;
