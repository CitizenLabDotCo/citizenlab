import React from 'react';

import { Box, Title, Text, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import DocumentAnalysis from '../resources/DocumentAnalysis.svg';

const FeatureDescription = () => {
  const { formatMessage } = useIntl();
  return (
    <Box
      bgColor={colors.white}
      display="flex"
      flexDirection="column"
      gap="20px"
    >
      <img src={DocumentAnalysis} alt="" />
      <Title m="0px" variant="h3" fontWeight="semi-bold">
        {formatMessage(messages.aiPoweredInsights)}
      </Title>
      <Text m="0px" color="grey700">
        {formatMessage(messages.aiPoweredInsightsDescription)}
      </Text>
    </Box>
  );
};

export default FeatureDescription;
