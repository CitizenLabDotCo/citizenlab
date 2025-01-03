import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { toBackendDateString, parseBackendDateString } from 'utils/dateUtils';

import messages from './messages';
import TrafficReportPreview from './TrafficReportPreview';

const TrafficDatesRange = ({
  defaultStartDate,
  defaultEndDate,
}: {
  defaultStartDate: string | undefined;
  defaultEndDate: string | undefined;
}) => {
  const { projectId } = useParams() as { projectId: string };

  const { formatMessage } = useIntl();

  const [startAt, setStartAt] = useState(defaultStartDate);
  const [endAt, setEndAt] = useState(defaultEndDate);

  return (
    <div>
      <Box mx="44px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <Box w="100%" display="flex">
          <DateRangePicker
            selectedRange={{
              from: parseBackendDateString(startAt),
              to: parseBackendDateString(endAt),
            }}
            onUpdateRange={({ from, to }) => {
              setStartAt(toBackendDateString(from));
              setEndAt(toBackendDateString(to));
            }}
          />
        </Box>
      </Box>
      <Box mx="44px" mb="20px">
        <Warning>
          <Text color="primary" m="0px">
            {formatMessage(messages.cookieBannerUpdatedInfo)}
          </Text>
        </Warning>
      </Box>

      <Box p="44px" mx="44px" bg="white">
        <TrafficReportPreview
          projectId={projectId}
          startAt={startAt}
          endAt={endAt}
        />
      </Box>
    </div>
  );
};

export default TrafficDatesRange;
