import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/DateTimeSelection/TimeInput';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedTime: Date;
  onTimeChange: (time: Date) => void;
}

const WhenSection = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const timezone =
    appConfiguration?.data.attributes.settings.core.timezone ?? '';

  return (
    <Box mb="8px">
      <Text fontWeight="bold" mb="12px">
        {formatMessage(messages.when)}
      </Text>
      <Box display="flex" gap="12px">
        <DateSinglePicker
          selectedDate={selectedDate}
          onChange={(date) => {
            const h = selectedDate.getHours();
            const m = selectedDate.getMinutes();
            date.setHours(h);
            date.setMinutes(m);
            onDateChange(date);
          }}
          placement="right"
        />
        <TimeInput selectedTime={selectedTime} onChange={onTimeChange} />
        {timezone && (
          <Text color="grey600" fontSize="s">
            {timezone}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default WhenSection;
