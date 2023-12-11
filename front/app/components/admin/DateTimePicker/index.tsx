import React from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';

// styling
import styled from 'styled-components';
import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { useIntl } from 'utils/cl-intl';
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
