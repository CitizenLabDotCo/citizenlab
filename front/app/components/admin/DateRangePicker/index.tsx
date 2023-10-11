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
  const handleOnChangeStartDate = (newStartDate: Date | null) => {
    onDatesChange({
      startDate: moment(newStartDate),
      endDate,
    });
  };

  const handleOnChangeEndDate = (newEndDate: Date | null) => {
    onDatesChange({
      startDate,
      endDate: moment(newEndDate),
    });
  };

  const convertedStartDate = moment(startDate).toDate();
  const convertedEndDate = moment(endDate).toDate();
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
      />
    </StylingWrapper>
  );
};

export default DateRangePicker;
