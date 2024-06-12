import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import {
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px ${colors.borderDark};

  /*
    Added to ensure the color contrast required to meet WCAG AA standards.
  */
  .react-datepicker__day--today {
    background-color: ${colors.white};
    color: ${colors.black};
    border: 1px solid ${colors.black};
    border-radius: ${stylingConsts.borderRadius};
  }

  /*
    If today's date is 20/5 and you go back to the previous month, 20/4 receives the "...keyboard-selected" class,
    also resulting in the default light-blue background that the "...today" class receives.
    No border is needed here because on focus, the browser adds a border
  */
  .react-datepicker__day--keyboard-selected {
    background-color: ${colors.white};
  }

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
