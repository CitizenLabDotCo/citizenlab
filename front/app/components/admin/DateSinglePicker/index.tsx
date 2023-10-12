import React from 'react';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import { colors, fontSizes } from '@citizenlab/cl2-component-library';

const Container = styled.div`
  display: flex;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px ${colors.borderDark};

  input {
    width: 100%;
    color: ${colors.grey800};
    font-size: ${fontSizes.base}px;
    padding: 12px;
  }
`;

type Props = {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
};

const DateSinglePicker = ({ selectedDate, onChange }: Props) => {
  return (
    <Container>
      <DatePicker selected={selectedDate} onChange={onChange} />
    </Container>
  );
};

export default DateSinglePicker;
