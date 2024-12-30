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
  const startAtDate = new Date(startAt);
  const endAtDate = new Date(endAt);

  const updateStartAt = (date: Date) => {
    const currentDifference = endAtDate.getTime() - startAtDate.getTime();

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: date.toISOString(),
      end_at: new Date(date.getTime() + currentDifference).toISOString(),
    }));
  };

  const updateEndAt = (date: Date) => {
    let newStartAtDate = new Date(startAtDate);
    const newEndAtDateIsBeforeStartDate = date < startAtDate;

    if (newEndAtDateIsBeforeStartDate) {
      const currentDifference = endAtDate.getTime() - startAtDate.getTime();
      newStartAtDate = new Date(date.getTime() - currentDifference);
    }

    setAttributeDiff((prev) => ({
      ...prev,
      start_at: newStartAtDate.toISOString(),
      end_at: date.toISOString(),
    }));
  };

  return (
    <Box display="flex" flexDirection="column" maxWidth="400px">
      <Box>
        <Label>
          <FormattedMessage {...messages.dateStartLabel} />
        </Label>
        <Box display="flex" flexDirection="row">
          <DateSinglePicker
            selectedDate={startAtDate}
            onChange={(date) => {
              const h = startAtDate.getHours();
              const m = startAtDate.getMinutes();
              date.setHours(h);
              date.setMinutes(m);
              updateStartAt(date);
            }}
          />
          <Box ml="12px">
            <TimeInput selectedDate={startAtDate} onChange={updateStartAt} />
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
            onChange={(date) => {
              const h = endAtDate.getHours();
              const m = endAtDate.getMinutes();
              date.setHours(h);
              date.setMinutes(m);
              updateEndAt(date);
            }}
          />
          <Box ml="12px">
            <TimeInput selectedDate={endAtDate} onChange={updateEndAt} />
          </Box>
        </Box>
        <ErrorComponent apiErrors={get(errors, 'end_at')} />
      </Box>
    </Box>
  );
};

export default DateTimeSelection;
