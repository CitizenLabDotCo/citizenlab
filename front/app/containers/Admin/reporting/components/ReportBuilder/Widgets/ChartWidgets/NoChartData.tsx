import React from 'react';

// components
import { Box, Title, Text } from '@citizenlab/cl2-component-library';

// hooks
import { useIntl } from 'utils/cl-intl';

// messages
import messages from './messages';

type NoChartProps = {
  title: string | undefined;
};

const NoChartData = ({ title }: NoChartProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box width="100%" pb="20px">
      <Title variant="h3" color="primary" m="16px">
        {title}
      </Title>
      <Box
        px="20px"
        width="100%"
        display="flex"
        flexDirection="row"
        className="no-chart-data"
      >
        <Text variant="bodyM" color="textSecondary">
          {formatMessage(messages.noData)}
        </Text>
      </Box>
    </Box>
  );
};

export default NoChartData;
