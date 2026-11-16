import React, { ReactNode } from 'react';

import { CalendarDate } from '@internationalized/date';
import {
  Button,
  DatePicker as AriaDatePicker,
  DateValue,
  Dialog,
  Group,
  Popover,
} from 'react-aria-components';

import Calendar from '../Calendar';
import DateSegments from '../DateField/DateSegments';
import { FieldHelp, FieldLabel, fieldStyles } from '../Field';
import Icon from '../Icon';
import '../tokens.css';

import styles from './DatePicker.module.css';

export type DatePickerProps = {
  label: ReactNode;
  description?: ReactNode;
  errorMessage?: ReactNode;
  size?: 36 | 32;
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onChange?: (value: CalendarDate | null) => void;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  name?: string;
  id?: string;
  autoFocus?: boolean;
  'data-cy'?: string;
};

const DatePicker = ({
  label,
  description,
  errorMessage,
  size = 36,
  value,
  defaultValue,
  onChange,
  minValue,
  maxValue,
  isDateUnavailable,
  isRequired,
  isInvalid,
  isDisabled,
  isOpen,
  defaultOpen,
  onOpenChange,
  name,
  id,
  autoFocus,
  'data-cy': dataCy,
}: DatePickerProps) => (
  <AriaDatePicker<CalendarDate>
    className={styles.picker}
    value={value}
    defaultValue={defaultValue}
    onChange={onChange}
    minValue={minValue}
    maxValue={maxValue}
    isDateUnavailable={isDateUnavailable}
    isRequired={isRequired}
    isInvalid={isInvalid}
    isDisabled={isDisabled}
    isOpen={isOpen}
    defaultOpen={defaultOpen}
    onOpenChange={onOpenChange}
    firstDayOfWeek="mon"
    name={name}
    id={id}
    autoFocus={autoFocus}
    data-cy={dataCy}
  >
    <FieldLabel isRequired={isRequired}>{label}</FieldLabel>
    <div className={fieldStyles.control}>
      <Group className={`${styles.box} ${styles[`size${size}`]}`}>
        <DateSegments className={styles.segments} />
        <Button className={styles.calendarButton}>
          <Icon name="calendar-16" />
        </Button>
      </Group>
      <FieldHelp description={description} errorMessage={errorMessage} />
    </div>
    <Popover className={styles.popover} placement="bottom start" offset={4}>
      <Dialog className={styles.dialog}>
        <Calendar />
      </Dialog>
    </Popover>
  </AriaDatePicker>
);

export default DatePicker;
