import React, { useState } from 'react';

import { Box, IconTooltip, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { useParams } from 'react-router-dom';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';
import ResolutionControl, {
  IResolution,
} from 'components/admin/ResolutionControl';

import { useIntl } from 'utils/cl-intl';
import { toBackendDateString, parseBackendDateString } from 'utils/dateUtils';

import Charts from './Charts';
import messages from './messages';

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
  const [resolution, setResolution] = useState<IResolution>('month');

  return (
    <div>
      <Box mx="44px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <Box w="100%" display="flex" justifyContent="space-between">
          <Box display="flex" alignItems="center">
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
            <IconTooltip
              ml="12px"
              content={formatMessage(messages.visitorDataBanner)}
            />
          </Box>
          <ResolutionControl value={resolution} onChange={setResolution} />
        </Box>
      </Box>
      <Box mx="36px">
        <Charts
          projectId={projectId}
          startAtMoment={moment(startAt)}
          endAtMoment={moment(endAt)}
          resolution={resolution}
        />
      </Box>
    </div>
  );
};

export default TrafficDatesRange;
