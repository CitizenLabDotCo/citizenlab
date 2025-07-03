import React from 'react';

import {
  Box,
  colors,
  Divider,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { hexToRGBA } from 'utils/helperUtils';

import InformationItem from './InformationItem';
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
      <InformationItem
        iconName={'upload-file'}
        mainText={messages.uploadAnyFile}
        secondaryText={messages.uploadAnyFileDescription}
        iconColor={colors.teal400}
        iconBackgroundColor={hexToRGBA(colors.teal400, 0.1)}
      />
      <InformationItem
        iconName={'paperclip'}
        mainText={messages.addFilesToProject}
        secondaryText={messages.addFilesToProjectDescription}
        iconColor={colors.teal400}
        iconBackgroundColor={hexToRGBA(colors.teal400, 0.1)}
      />
      <InformationItem
        iconName={'chart-bar'}
        mainText={messages.useAIOnFiles}
        secondaryText={messages.useAIOnFilesDescription}
        iconColor={colors.teal400}
        iconBackgroundColor={hexToRGBA(colors.teal400, 0.1)}
      />
      <InformationItem
        iconName={'stars'}
        mainText={messages.addFilesToSensemaking}
        secondaryText={messages.addFilesToSensemakingDescription}
        iconColor={colors.teal400}
        iconBackgroundColor={hexToRGBA(colors.teal400, 0.1)}
      />
      <Divider />
      <InformationItem
        iconName={'arrow-up'}
        mainText={messages.comingSoon}
        secondaryText={messages.comingSoonDescription}
        iconColor={colors.teal400}
        iconBackgroundColor={hexToRGBA(colors.teal400, 0.1)}
      />
    </Box>
  );
};

export default FeatureInformation;
