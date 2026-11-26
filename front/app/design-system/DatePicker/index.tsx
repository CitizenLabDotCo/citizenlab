import React, { ReactNode } from 'react';

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
import DateSegments from '../DateField/DateSegments';
import dayFirstLocale from '../DateField/dayFirstLocale';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';

import styles from './DatePicker.module.css';
import '../tokens.css';

type Props = {
  label: ReactNode;
  errorMessage?: ReactNode;
  value: CalendarDate | null;
  onChange: (value: CalendarDate | null) => void;
  isInvalid?: boolean;
  id?: string;
};

const DatePicker = ({
  label,
  errorMessage,
  value,
  onChange,
  isInvalid,
  id,
}: Props) => {
  const { locale } = useLocale();

  return (
    <I18nProvider locale={dayFirstLocale(locale)}>
  <AriaDatePicker<CalendarDate>
    className={styles.picker}
    value={value}
    onChange={onChange}
    isInvalid={isInvalid}
    firstDayOfWeek="mon"
    id={id}
  >
    <FieldLabel>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      <Group className={`${styles.box} ${styles.size36}`}>
        <DateSegments className={styles.segments} />
        <Button className={styles.calendarButton}>
          <Icon name="calendar-16" />
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

export default DatePicker;
