import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';

import messages from '../../../messages';

import InformationItem from './components/InformationItem';

const informationPoints = [
  {
    iconName: 'video',
    mainText: messages.informationPoint1Title,
    secondaryText: messages.informationPoint1Description,
  },
  {
    iconName: 'page',
    mainText: messages.informationPoint2Title,
    secondaryText: messages.informationPoint2Description,
  },
  {
    iconName: 'image',
    mainText: messages.informationPoint3Title,
    secondaryText: messages.informationPoint3Description,
  },
] as const;

// InformationSection component displays a section with information about file uploading.
const InformationSection = () => {
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
      {informationPoints.map((feature, index) => (
        <InformationItem
          key={index}
          iconName={feature.iconName}
          mainText={feature.mainText}
          secondaryText={feature.secondaryText}
        />
      ))}
    </Box>
  );
};

export default InformationSection;
