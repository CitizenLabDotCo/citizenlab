import React from 'react';

import { Box, colors, Image, Title } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import UpsellHealthScorePreviewSvg from '../assets/Upsell_Health_Score_Preview.svg';
import messages from '../messages';

const HealthScore = () => {
  const { formatMessage } = useIntl();

  return (
    <Box
      mt="38px"
      ml="40px"
      px="24px"
      py="24px"
      borderRadius={'4px'}
      border={`1px solid ${colors.borderLight}`}
      display="flex"
      flexDirection="column"
      width="160px"
      background={colors.white}
    >
      <Title m="0px" variant="h5">
        {formatMessage(messages.healthScore)}
      </Title>
      <Image w="120px" src={UpsellHealthScorePreviewSvg} alt="" />
    </Box>
  );
};

export default HealthScore;
