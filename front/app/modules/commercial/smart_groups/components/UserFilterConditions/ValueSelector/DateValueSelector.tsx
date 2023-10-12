import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';
import { colors, fontSizes } from '@citizenlab/cl2-component-library';

type Props = {
  value?: string;
  onChange: (dateStr: string) => void;
};

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

const DateValueSelector = ({ value, onChange }: Props) => {
  const handleOnChange = (date: Date | null) => {
    if (date) {
      onChange(moment(date).format('YYYY-MM-DD'));
    }
  };

  return (
    <Container>
      <DatePicker
        selected={typeof value === 'string' ? new Date(value) : null}
        onChange={handleOnChange}
      />
    </Container>
  );
};

export default DateValueSelector;
