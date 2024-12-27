import React from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';

import { IEventProperties } from 'api/events/types';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import ErrorComponent from 'components/UI/Error';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import { ErrorType } from '../../types';

import TimeInput from './TimeInput';

interface Props {
  startAt: string;
  endAt: string;
  errors: ErrorType;
  setAttributeDiff: React.Dispatch<React.SetStateAction<IEventProperties>>;
}

const DateTimeSelection = ({
  startAt,
  endAt,
  errors,
  setAttributeDiff,
}: Props) => {
  const handleSelectStartAtDay = (date: Date) => {
    setAttributeDiff((prev) => ({
      ...prev,
      start_at: date.toISOString(),
    }));
  };

  const handleSelectEndAtDay = (date: Date) => {
    setAttributeDiff((prev) => ({
      ...prev,
      end_at: date.toISOString(),
    }));
  };

  const handleSelectStartAtTime = (newDate: Date) => {
    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newDate.toISOString(),
    }));
  };

  const handleSelectEndAtTime = (newDate: Date) => {
    setAttributeDiff((prev) => ({
      ...prev,
      end_at: newDate.toISOString(),
    }));
  };

  const startAtDate = new Date(startAt);
  const endAtDate = new Date(endAt);

  return (
    <Box display="flex" flexDirection="column" maxWidth="400px">
      <Box>
        <Label>
          <FormattedMessage {...messages.dateStartLabel} />
        </Label>
        <Box display="flex" flexDirection="row">
          <DateSinglePicker
            selectedDate={startAtDate}
            onChange={handleSelectStartAtDay}
          />
          <Box ml="12px">
            <TimeInput
              selectedDate={startAtDate}
              onChange={handleSelectStartAtTime}
            />
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
            selectedDate={endAtDate}
            onChange={handleSelectEndAtDay}
          />
          <Box ml="12px">
            <TimeInput
              selectedDate={endAtDate}
              onChange={handleSelectEndAtTime}
            />
          </Box>
        </Box>
        <ErrorComponent apiErrors={get(errors, 'end_at')} />
      </Box>
    </Box>
  );
};

export default DateTimeSelection;
