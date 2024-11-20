import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

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

  const [startAt, setStartAt] = useState<string | undefined>(defaultStartDate);
  const [endAt, setEndAt] = useState<string | undefined>(defaultEndDate);

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
      <Box mx="44px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <DateRangePicker
          startDate={startAt ? moment(startAt) : null}
          endDate={endAt ? moment(endAt) : null}
          onDatesChange={handleChangeTimeRange}
        />
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
