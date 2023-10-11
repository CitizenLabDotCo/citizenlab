import React, { useState } from 'react';
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
  startDate: Moment | null | undefined;
  endDate: Moment | null;
  onChangeStartDate: (
    date: Date | null,
    event: React.SyntheticEvent<any, Event> | undefined
  ) => void;
  onChangeEndDate: (
    date: Date | null,
    event: React.SyntheticEvent<any, Event> | undefined
  ) => void;
}

const DateRangePicker2 = ({
  startDate,
  endDate,
  onChangeStartDate,
  onChangeEndDate,
}: Props) => {
  const handleOnChangeStartDate = () => {};
  const handleOnChangeEndDate = () => {};
  const convertedStartDate = moment(startDate).toDate();
  const convertedEndDate = moment(endDate).toDate();

  return (
    <StylingWrapper>
      <DatePicker
        selected={convertedStartDate}
        onChange={handleOnChangeStartDate}
        selectsStart
        startDate={convertedStartDate}
        endDate={convertedEndDate}
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
        minDate={convertedStartDate}
      />
    </StylingWrapper>
  );
};

export default DateRangePicker2;
