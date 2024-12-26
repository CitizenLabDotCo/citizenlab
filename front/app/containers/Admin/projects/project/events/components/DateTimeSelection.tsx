import React from 'react';

import { Box, Label, Input } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import ErrorComponent from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { ErrorType } from '../types';

interface Props {
  eventAttrs: Record<string, any>;
  errors: ErrorType;
}

// For the 'step' (interval) attribute of the input[type="time"] element,
// seconds are used. So 15 minutes is 15 * 60 seconds.
const FIFTEEN_MINUTES = 15 * 60;

const DateTimeSelection = ({ eventAttrs, errors }: Props) => {
  const handleSelectStartAtDay = (_date: Date) => {
    // TODO
  };

  const handleSelectEndAtDay = (_date: Date) => {
    // TODO
  };

  return (
    <Box display="flex" flexDirection="column" maxWidth="400px">
      <Box>
        <Label>
          <FormattedMessage {...messages.dateStartLabel} />
        </Label>
        <Box display="flex" flexDirection="row">
          <DateSinglePicker
            selectedDate={
              eventAttrs.start_at ? new Date(eventAttrs.start_at) : undefined
            }
            onChange={handleSelectStartAtDay}
          />
          <Input type="time" step={FIFTEEN_MINUTES} />
        </Box>
        <ErrorComponent apiErrors={get(errors, 'start_at')} />
      </Box>

      <Box mt="12px">
        <Label>
          <FormattedMessage {...messages.datesEndLabel} />
        </Label>
        <Box display="flex" flexDirection="row">
          <DateSinglePicker
            selectedDate={
              eventAttrs.end_at ? new Date(eventAttrs.end_at) : undefined
            }
            onChange={handleSelectEndAtDay}
          />
          <Input type="time" step={FIFTEEN_MINUTES} />
        </Box>
        <ErrorComponent apiErrors={get(errors, 'end_at')} />
      </Box>
    </Box>
  );
};

export default DateTimeSelection;
