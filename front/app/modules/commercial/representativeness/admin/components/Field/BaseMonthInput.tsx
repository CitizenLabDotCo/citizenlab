import React from 'react';

// components
import { Box, Text, Icon } from '@citizenlab/cl2-component-library';
import MonthSelect from './DateSelects/MonthSelect';
import YearSelect from './DateSelects/YearSelect';

// styling
import { colors } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const BaseDateInput = () => {
  const noop = console.log;
  return (
    <Box display="flex" mt="28px" width="100%">
      <Box width="50%" display="flex" alignItems="center">
        <Icon
          name="calendar"
          width="16px"
          height="16px"
          fill={colors.label}
          mr="12px"
          mb="3px"
        />
        <Text variant="bodyM" color="label">
          <FormattedMessage {...messages.baseMonth} />
        </Text>
      </Box>
      <Box width="50%">
        <MonthSelect onChange={noop} />
        <YearSelect onChange={noop} minYear={2000} />
      </Box>
    </Box>
  );
};

export default BaseDateInput;
