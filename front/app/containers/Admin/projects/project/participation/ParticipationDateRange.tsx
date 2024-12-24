import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString, toBackendDateString } from 'utils/dateUtils';

import messages from './messages';
import ParticipationReportPreview from './ParticipationReportPreview';

const ParticipationDatesRange = ({
  defaultStartDate,
  defaultEndDate,
}: {
  defaultStartDate?: string;
  defaultEndDate?: string;
}) => {
  const { projectId } = useParams() as { projectId: string };

  const { formatMessage } = useIntl();

  const [startAt, setStartAt] = useState(defaultStartDate);
  const [endAt, setEndAt] = useState(defaultEndDate);

  return (
    <div>
      <Box px="44px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <Box width="100%" display="flex">
          <DateRangePicker
            selectedRange={{
              from: startAt ? parseBackendDateString(startAt) : undefined,
              to: endAt ? parseBackendDateString(endAt) : undefined,
            }}
            onUpdateRange={({ from, to }) => {
              setStartAt(toBackendDateString(from));
              setEndAt(toBackendDateString(to));
            }}
          />
        </Box>
      </Box>
      <Box p="44px" m="44px" bg="white">
        <ParticipationReportPreview
          projectId={projectId}
          startAt={startAt}
          endAt={endAt}
        />
      </Box>
    </div>
  );
};

export default ParticipationDatesRange;
