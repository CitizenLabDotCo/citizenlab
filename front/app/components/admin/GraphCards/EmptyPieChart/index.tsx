import React from 'react';

// components
import { Box, Image } from '@citizenlab/cl2-component-library';
import { NoDataContainer } from 'components/admin/GraphWrappers';

import EmptyPieChartImageSrc from './empty.svg';
import { colors } from 'utils/styleUtils';

// i18n
import messages from 'components/admin/Graphs/messages';
import { FormattedMessage } from 'utils/cl-intl';

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
