import React from 'react';
import DatePicker from 'react-datepicker';
import moment, { Moment } from 'moment';
import styled from 'styled-components';
import {
  Box,
  Icon,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
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
    }
  }
`;

interface Props {
  startDate: Moment | null;
  endDate: Moment | null;
  onDatesChange: ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => void;
  minDate?: Moment;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onDatesChange,
  minDate,
}: Props) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const handleOnChangeStartDate = (newStartDate: Date | null) => {
    // with this check, we don't allow removing a date
    // (forcing users to pick a date if changes need to persist)
    if (newStartDate) {
      onDatesChange({
        startDate: moment(newStartDate),
        endDate,
      });
    }
  };

  const handleOnChangeEndDate = (newEndDate: Date | null) => {
    // with this check, we don't allow removing a date
    // (forcing users to pick a date if changes need to persist)
    if (newEndDate) {
      onDatesChange({
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

  return (
    <StylingWrapper>
      <DatePicker
        selected={convertedStartDate}
        onChange={handleOnChangeStartDate}
        selectsStart
        startDate={convertedStartDate}
        endDate={convertedEndDate}
        minDate={convertedMinDate}
        locale={locale}
        dateFormat="P"
      />
      <Box mx="8px">
        <Icon name="arrow-right" fill={colors.grey700} />
      </Box>
      <DatePicker
        selected={convertedEndDate}
        onChange={handleOnChangeEndDate}
        selectsEnd
        startDate={convertedStartDate}
        endDate={convertedEndDate}
        locale={locale}
        dateFormat="P"
      />
    </StylingWrapper>
  );
};

export default DateRangePicker;
