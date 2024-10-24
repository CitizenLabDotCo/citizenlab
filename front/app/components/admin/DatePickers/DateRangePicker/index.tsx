import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Box,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

const StylingWrapper = styled.div`
  display: flex;
  align-items: center;

  .react-datepicker-wrapper {
    border-radius: ${(props) => props.theme.borderRadius};
    border: solid 1px ${colors.borderDark};
    background: white;
    padding: 10px 8px;

    &:hover {
      border-color: ${colors.black};
    }

    input[type='text'] {
      color: ${colors.textPrimary};
      font-size: ${fontSizes.base}px;
      line-height: normal;
      font-weight: 400;
      background: transparent;
      width: 100%;
    }
  }
`;

export type Dates = {
  startDate: Moment | null;
  endDate: Moment | null;
};

interface Props {
  startDate: Moment | null;
  endDate: Moment | null;
  onDatesChange: ({ startDate, endDate }: Dates) => void;
  minDate?: Moment;
  maxDate?: Moment;
  startDatePlaceholderText?: string;
  endDatePlaceholderText?: string;
  excludeDates?: Moment[];
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDatesChange,
  minDate,
  maxDate,
  startDatePlaceholderText,
  endDatePlaceholderText,
  excludeDates,
}: Props) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;
  const localeUsed = locale === 'en' ? 'en-GB' : locale;

  const handleOnChangeStartDate = (newStartDate: Date | null) => {
    // with this check, we don't allow removing a date
    // (forcing users to pick a date if changes need to persist)
    if (newStartDate) {
      onDatesChange({
        startDate: moment(newStartDate),
        endDate:
          endDate && endDate < moment(newStartDate)
            ? // if the new start date is after the currently selected end date,
              // we set the end date to the new start date
              moment(newStartDate)
            : endDate,
      });
    }
  };

  const handleOnChangeEndDate = (newEndDate: Date | null) => {
    // with this check, we don't allow removing a date
    // (forcing users to pick a date if changes need to persist)
    if (newEndDate) {
      onDatesChange({
        // we don’t need a check here as we do in handleOnChangeStartDate
        // because of the minDate prop in the end date DatePicker
        startDate,
        endDate: moment(newEndDate),
      });
    }
  };

  // Passing null to moment() crashes this component. Calling toDate on this returns "Invalid date",
  // which crashes DatePicker.
  const convertedStartDate = startDate ? moment(startDate).toDate() : null;
  const convertedEndDate = endDate ? moment(endDate).toDate() : null;
  const convertedMinDate = minDate ? moment(minDate).toDate() : null;
  const convertedMaxDate = maxDate ? moment(maxDate).toDate() : null;
  const convertedExcludeDates =
    excludeDates?.map((date) => moment(date).toDate()) || [];

  return (
    <StylingWrapper>
      <DatePicker
        id="e2e-start-date-input"
        selected={convertedStartDate}
        onChange={handleOnChangeStartDate}
        selectsStart
        startDate={convertedStartDate}
        endDate={convertedEndDate}
        minDate={convertedMinDate}
        locale={localeUsed}
        excludeDates={convertedExcludeDates}
        placeholderText={startDatePlaceholderText}
        // This makes sure we adjust date based on the passed locale.
        dateFormat="P"
        popperClassName="e2e-start-date-popper"
        autoComplete="off"
      />
      <Box mx="8px">
        <Icon name="arrow-right" fill={colors.grey700} />
      </Box>
      <DatePicker
        id="e2e-end-date-input"
        selected={convertedEndDate}
        onChange={handleOnChangeEndDate}
        selectsEnd
        startDate={convertedStartDate}
        endDate={convertedEndDate}
        minDate={convertedStartDate}
        maxDate={convertedMaxDate}
        excludeDates={convertedExcludeDates}
        locale={localeUsed}
        // This makes sure we adjust date based on the passed locale.
        dateFormat="P"
        placeholderText={endDatePlaceholderText}
        popperClassName="e2e-end-date-popper"
        autoComplete="off"
      />
    </StylingWrapper>
  );
};

export default DateRangePicker;
