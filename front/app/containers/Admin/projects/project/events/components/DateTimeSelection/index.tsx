import React from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import ErrorComponent from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import { ErrorType } from '../../types';

import TimeInput from './TimeInput';
import { Hour, Minute } from './types';

interface Props {
  eventAttrs: Record<string, any>;
  errors: ErrorType;
}

const DateTimeSelection = ({ eventAttrs, errors }: Props) => {
  const handleSelectStartAtDay = (_date: Date) => {
    // TODO
  };

  const handleSelectEndAtDay = (_date: Date) => {
    // TODO
  };

  const handleSelectStartAtTime = (h: Hour, m: Minute) => {
    console.log({ h, m });
  };

  const handleSelectEndAtTime = (h: Hour, m: Minute) => {
    console.log({ h, m });
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
          <Box ml="12px">
            <TimeInput h={18} m={15} onChange={handleSelectStartAtTime} />
          </Box>
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
          <Box ml="12px">
            <TimeInput h={18} m={15} onChange={handleSelectEndAtTime} />
          </Box>
        </Box>
        <ErrorComponent apiErrors={get(errors, 'end_at')} />
      </Box>
    </Box>
  );
};

export default DateTimeSelection;
