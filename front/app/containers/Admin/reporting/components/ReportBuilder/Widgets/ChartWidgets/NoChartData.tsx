import React from 'react';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type noChartProps = {
  title: string | undefined;
};

const NoChartData = ({ title }: noChartProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box width="100%" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Text variant="bodyM" color="textSecondary">
          {formatMessage(messages.noData)}
        </Text>
      </Box>
    </Box>
  );
};

export default NoChartData;
