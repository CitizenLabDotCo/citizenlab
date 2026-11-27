import React from 'react';

import { CalendarDate } from '@internationalized/date';
import {
  Button,
  DatePicker as AriaDatePicker,
  Dialog,
  Group,
  I18nProvider,
  Popover,
  useLocale,
} from 'react-aria-components';

import Calendar from '../Calendar';
import dayFirstLocale from '../DateField/dayFirstLocale';
import { FieldHelp, fieldStyles } from '../Field';
import Icon from '../Icon';

import styles from './DateTimeRow.module.css';
import '../tokens.css';

type Props = {
  'aria-label': string;
  value: CalendarDate | null;
  onChange: (value: CalendarDate | null) => void;
  placeholder?: string;
  isInvalid?: boolean;
  errorMessage?: string;
  id?: string;
};

// The date line of the library's Date and time row: the whole field opens the
// calendar and shows the date written out, day first.
const DateRow = ({
  'aria-label': ariaLabel,
  value,
  onChange,
  placeholder,
  isInvalid,
  errorMessage,
  id,
}: Props) => {
  const { locale } = useLocale();
  const dateLocale = dayFirstLocale(locale);
  const text = value
    ? new Intl.DateTimeFormat(dateLocale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(value.year, value.month - 1, value.day))
    : placeholder;

  return (
    <I18nProvider locale={dateLocale}>
      <AriaDatePicker<CalendarDate>
        className={styles.field}
        value={value}
        onChange={onChange}
        isInvalid={isInvalid}
        firstDayOfWeek="mon"
        aria-label={ariaLabel}
        id={id}
      >
        <div className={fieldStyles.control}>
          <Group className={styles.frame}>
            <Button className={styles.trigger} aria-label={text}>
              <Icon name="calendar-16" className={styles.icon} />
              <span className={value ? styles.value : styles.placeholder}>
                {text}
              </span>
            </Button>
          </Group>
          <FieldHelp errorMessage={errorMessage} />
        </div>
        <Popover className={styles.popover} placement="bottom start" offset={4}>
          <Dialog className={styles.dialog}>
            <Calendar />
          </Dialog>
        </Popover>
      </AriaDatePicker>
    </I18nProvider>
  );
};

export default DateRow;
