import React from 'react';

import { Box, Image, colors, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import UpsellChartPreview from '../assets/Upsell_Chart_Preview.svg';
import messages from '../messages';

const HealthScoreChart = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      mt="40px"
      ml="40px"
      p="16px"
      borderRadius={'4px'}
      border={`1px solid ${colors.borderLight}`}
      display="flex"
      flexDirection="column"
      width="136px"
      background={colors.white}
    >
      <Title m="0px" mb="8px" variant="h4" fontSize="xs">
        {formatMessage(messages.scoreOverTime)}
      </Title>
      <Image w="100px" src={UpsellChartPreview} alt="" />
    </Box>
  );
};

export default HealthScoreChart;
