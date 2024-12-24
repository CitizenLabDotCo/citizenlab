import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useIntl } from 'utils/cl-intl';

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

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setStartAt(startDate?.format('YYYY-MM-DD'));
    setEndAt(endDate?.format('YYYY-MM-DD'));
  };

  return (
    <div>
      <Box px="44px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <Box width="100%" display="flex">
          <DateRangePicker
            selectedRange={{
              from: startAt ? new Date(startAt) : undefined,
              to: endAt ? new Date(endAt) : undefined,
            }}
            onUpdateRange={({ from, to }) => {
              handleChangeTimeRange({
                startDate: from ? moment(from) : null,
                endDate: to ? moment(to) : null,
              });
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
