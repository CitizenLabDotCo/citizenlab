import React from 'react';

import { Box, Image, colors } from '@citizenlab/cl2-component-library';

import messages from 'components/admin/Graphs/messages';
import { NoDataContainer } from 'components/admin/GraphWrappers';

import { FormattedMessage } from 'utils/cl-intl';

import EmptyPieChartImageSrc from './empty.svg';

const EmptyPieChart = () => (
  <NoDataContainer>
    <Box color={colors.coolGrey500}>
      <Image
        src={EmptyPieChartImageSrc}
        alt="Pie chart placeholder"
        marginRight="48px"
      />
      <FormattedMessage {...messages.noDataShort} />
    </Box>
  </NoDataContainer>
);

export default EmptyPieChart;
