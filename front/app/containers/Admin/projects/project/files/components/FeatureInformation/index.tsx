import React from 'react';

import {
  Box,
  colors,
  Divider,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import FeatureInformationItem from './components/FeatureInformationItem';
import messages from './messages';

const mainFeatures = [
  {
    iconName: 'upload-file',
    mainText: messages.uploadAnyFile,
    secondaryText: messages.uploadAnyFileDescription,
    name: 'uploadAnyFile',
  },
  {
    iconName: 'paperclip',
    mainText: messages.addFilesToProject,
    secondaryText: messages.addFilesToProjectDescription,
    name: 'addFilesToProject',
  },
  {
    iconName: 'stars',
    mainText: messages.addFilesToSensemaking,
    secondaryText: messages.addFilesToSensemakingDescription,
    name: 'addFilesToSensemaking',
  },
] as const;

const FeatureInformation = () => {
  const isDataRepositoryAIAnalysisEnabled = useFeatureFlag({
    name: 'data_repository_ai_analysis',
  });

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
      {mainFeatures.map((feature, index) => (
        <FeatureInformationItem
          key={index}
          iconName={feature.iconName}
          mainText={feature.mainText}
          secondaryText={feature.secondaryText}
          disabled={
            !isDataRepositoryAIAnalysisEnabled &&
            feature.name === 'addFilesToSensemaking'
          }
        />
      ))}
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
