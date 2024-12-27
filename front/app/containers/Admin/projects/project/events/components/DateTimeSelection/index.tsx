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
import { Hour, Minute } from './types';

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

  const handleSelectStartAtTime = (h: Hour, m: Minute) => {
    const newDate = new Date(startAt);
    newDate.setHours(h);
    newDate.setMinutes(m);
    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newDate.toISOString(),
    }));
  };

  const handleSelectEndAtTime = (h: Hour, m: Minute) => {
    const newDate = new Date(startAt);
    newDate.setHours(h);
    newDate.setMinutes(m);
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
            selectedDate={startAt ? new Date(startAt) : undefined}
            onChange={handleSelectStartAtDay}
          />
          <Box ml="12px">
            <TimeInput
              h={startAtDate.getHours() as Hour}
              m={startAtDate.getMinutes() as Minute}
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
            selectedDate={endAt ? new Date(endAt) : undefined}
            onChange={handleSelectEndAtDay}
          />
          <Box ml="12px">
            <TimeInput
              h={endAtDate.getHours() as Hour}
              m={endAtDate.getMinutes() as Minute}
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
