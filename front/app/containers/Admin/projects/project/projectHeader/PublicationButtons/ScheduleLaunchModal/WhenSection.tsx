import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { startOfDay } from 'date-fns';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';

import { useIntl } from 'utils/cl-intl';
import { formatUtcOffset, getViewerZone } from 'utils/dateFormat';
import { nowInZone } from 'utils/dateUtils';

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
  const tenantTimeNow = nowInZone(timezone);
  const tenantTodayStart = startOfDay(tenantTimeNow);
  const gmtOffset = timezone
    ? formatUtcOffset(Date.now(), { timeZone: timezone })
    : '';
  const browserOffset = formatUtcOffset(Date.now(), {
    timeZone: getViewerZone(),
  });
  const showGmtOffset = timezone && gmtOffset !== browserOffset;
  return (
    <Box mb="8px">
      <Text fontWeight="bold" mb="12px">
        {formatMessage(messages.when)}
      </Text>
      <Box display="flex" gap="12px" alignItems="center">
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
          disabledPast={{ before: tenantTodayStart }}
        />
        <TimeInput
          selectedTime={selectedTime}
          onChange={onTimeChange}
          selectedDate={selectedDate}
          currentTimeInTz={tenantTimeNow}
        />
        {showGmtOffset && (
          <Text color="grey600" fontSize="s">
            GMT{gmtOffset}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default WhenSection;
