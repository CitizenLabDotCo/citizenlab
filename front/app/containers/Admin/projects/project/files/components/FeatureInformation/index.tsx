import React from 'react';

import {
  Box,
  colors,
  Divider,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import FeatureInformationItem from './FeatureInformationItem';
import messages from './messages';

const FeatureInformation = () => {
  return (
    <Box
      p="20px"
      display="flex"
      flexDirection="column"
      gap="20px"
      maxWidth="600px"
      background={colors.white}
      borderRadius={stylingConsts.borderRadius}
    >
      <FeatureInformationItem
        iconName="upload-file"
        mainText={messages.uploadAnyFile}
        secondaryText={messages.uploadAnyFileDescription}
      />
      <FeatureInformationItem
        iconName="paperclip"
        mainText={messages.addFilesToProject}
        secondaryText={messages.addFilesToProjectDescription}
      />
      <FeatureInformationItem
        iconName="chart-bar"
        mainText={messages.useAIOnFiles}
        secondaryText={messages.useAIOnFilesDescription}
      />
      <FeatureInformationItem
        iconName="stars"
        mainText={messages.addFilesToSensemaking}
        secondaryText={messages.addFilesToSensemakingDescription}
      />
      <Divider />
      <FeatureInformationItem
        iconName="arrow-up"
        mainText={messages.comingSoon}
        secondaryText={messages.comingSoonDescription}
      />
    </Box>
  );
};

export default FeatureInformation;
