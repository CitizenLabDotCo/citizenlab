import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'utils/router';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString, toBackendDateString } from 'utils/dateUtils';

import messages from './messages';
import ParticipationReportPreview from './ParticipationReportPreview';

interface Props {
  projectId?: string;
}

const Demographics = ({ projectId: _projectId }: Props) => {
  const { projectId: projectIdFromParams } = useParams({ strict: false }) as {
    projectId: string;
  };
  const projectId = _projectId || projectIdFromParams;

  const { formatMessage } = useIntl();

  const [startAt, setStartAt] = useState<string>();
  const [endAt, setEndAt] = useState<string>();

  return (
    <Box>
      <Box mb="20px">
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
      <Box>
        <ParticipationReportPreview
          projectId={projectId}
          startAt={startAt}
          endAt={endAt}
        />
      </Box>
    </Box>
  );
};

export default Demographics;
