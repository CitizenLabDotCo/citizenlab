import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';

import { isNilOrError } from 'utils/helperUtils';

import useLocale from 'hooks/useLocale';

const Container = styled.div`
  display: flex;
  flex-grow: 1;
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
  id?: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
};

const DateSinglePicker = ({
  id,
  selectedDate,
  onChange,
  disabled = false,
}: Props) => {
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  //
  return (
    <Container>
      <DatePicker
        id={id}
        selected={selectedDate}
        onChange={onChange}
        disabled={disabled}
        popperModifiers={[
          // This makes sure the calendar pop-out is visible in case we have
          // a tiny form (e.g. registration form in modal that only has 1 question).
          // You can try by creating a required
          // registration question that has a date as the answer.
          {
            name: 'preventOverflow',
            options: {
              rootBoundary: 'viewport',
              altAxis: true,
            },
          },
        ]}
        locale={locale}
        // This makes sure we adjust date based on the passed locale.
        dateFormat="P"
      />
    </Container>
  );
};

export default DateSinglePicker;
