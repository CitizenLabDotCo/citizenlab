import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';

import {
  Icon,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const Container = styled.div`
  display: flex;
  position: relative;
  padding: 0 16px;
  align-items: center;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px #ccc;

  .react-datepicker-wrapper {
    width: 100%;
    padding: 12px;

    input {
      width: 100%;
    }

    .react-datepicker-popper {
      z-index: 1;
    }
  }

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
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    outline: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
  }
`;

interface Props {
  value: string | undefined;
  onChange: (arg: moment.Moment) => void;
}

const DateTimePicker = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  if (isNilOrError(locale)) return null;

  const handleDateChange = (date: Date | null) => {
    const momentDate = date ? moment(date) : null;

    if (momentDate) {
      onChange(momentDate);
    }
  };

  return (
    <Container>
      <Icon name="calendar" fill={colors.blue500} />
      <DatePicker
        selected={value ? new Date(value) : new Date()}
        onChange={handleDateChange}
        showTimeSelect
        timeIntervals={15}
        // This makes sure we adjust date + time based on the passed locale.
        dateFormat="Pp"
        locale={locale}
        timeCaption={formatMessage(messages.time)}
      />
    </Container>
  );
};

export default DateTimePicker;
