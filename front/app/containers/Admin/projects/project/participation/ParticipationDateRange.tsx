import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';

import DateRangePicker from 'components/admin/DateRangePicker';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ParticipationReportPreview from './ParticipationReportPreview';

const ParticipationDatesRange = ({
  defaultStartDate,
  defaultEndDate,
}: {
  defaultStartDate: string | null;
  defaultEndDate: string | null;
}) => {
  const { projectId } = useParams() as { projectId: string };

  const { formatMessage } = useIntl();

  const [startAt, setStartAt] = useState<string | null>(defaultStartDate);
  const [endAt, setEndAt] = useState<string | null>(defaultEndDate);

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setStartAt(startDate?.format('YYYY-MM-DD') || null);
    setEndAt(endDate?.format('YYYY-MM-DD') || null);
  };

  return (
    <div>
      <Box px="32px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <DateRangePicker
          startDate={startAt ? moment(startAt) : null}
          endDate={endAt ? moment(endAt) : null}
          onDatesChange={handleChangeTimeRange}
        />
      </Box>
      <Box p="32px" bg="white">
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
